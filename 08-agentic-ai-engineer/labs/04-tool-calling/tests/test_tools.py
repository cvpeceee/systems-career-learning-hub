import time
from typing import Literal, Optional
from fakellm import ToolCall
from tools import type_to_schema, schema_for, validate, Registry

def get_firmware(device_id: str, include_history: bool = False) -> dict:
    """Return the firmware version installed on one device.

    Extra details for humans that the model doesn't need."""
    if device_id == "BAD":
        raise KeyError("no such device")
    return {"device_id": device_id, "version": "1.4.2"}

def set_led(device_id: str, color: Literal["red", "green", "off"], brightness: Optional[int] = None) -> str:
    """Set the status LED on a device."""
    return f"{device_id} LED {color}"

def tag_devices(ids: list[str], tag: str) -> int:
    """Attach a tag to several devices."""
    return len(ids)

def test_type_to_schema():
    assert type_to_schema(int) == {"type": "integer"}
    assert type_to_schema(list[str]) == {"type": "array", "items": {"type": "string"}}
    assert type_to_schema(Literal["a", "b"]) == {"type": "string", "enum": ["a", "b"]}
    assert type_to_schema(Optional[int]) == {"type": "integer"}
    assert type_to_schema(int | None) == {"type": "integer"}

def test_schema_from_signature_and_docstring():
    s = schema_for(get_firmware)
    assert s["name"] == "get_firmware"
    assert s["description"] == "Return the firmware version installed on one device."
    assert s["parameters"]["required"] == ["device_id"]
    assert s["parameters"]["properties"]["include_history"] == {"type": "boolean"}
    assert s["parameters"]["additionalProperties"] is False

def test_validate_reports_specific_problems():
    s = schema_for(set_led)["parameters"]
    assert validate(s, {"device_id": "D1", "color": "red"}) == []
    errs = validate(s, {"color": "blue", "speed": 3})
    joined = " | ".join(errs)
    assert "missing required argument 'device_id'" in joined
    assert "unknown argument 'speed'" in joined
    assert "one of ['red', 'green', 'off']" in joined
    assert validate(schema_for(get_firmware)["parameters"], {"device_id": 5})[0].startswith("'device_id' must be string")
    assert validate(schema_for(tag_devices)["parameters"], {"ids": ["a", 2], "tag": "x"}) == ["'ids' items must be string"]
    assert validate(schema_for(set_led)["parameters"], {"device_id": "D", "color": "red", "brightness": True}) != []  # bool is not int

def make_reg():
    r = Registry()
    for f in (get_firmware, set_led, tag_devices):
        r.tool(f)
    return r

def test_dispatch_success_and_json_encoding():
    r = make_reg()
    res = r.dispatch(ToolCall("get_firmware", {"device_id": "D1"}, id="c1"))
    assert not res.is_error and res.call_id == "c1" and '"version": "1.4.2"' in res.content
    assert r.dispatch(ToolCall("set_led", {"device_id": "D1", "color": "green"})).content == "D1 LED green"

def test_errors_become_results_not_exceptions():
    r = make_reg()
    unknown = r.dispatch(ToolCall("reboot", {}))
    assert unknown.is_error and "Available" in unknown.content and "get_firmware" in unknown.content
    bad = r.dispatch(ToolCall("set_led", {"device_id": "D1", "color": "blue"}))
    assert bad.is_error and "invalid arguments" in bad.content
    boom = r.dispatch(ToolCall("get_firmware", {"device_id": "BAD"}))
    assert boom.is_error and boom.content.startswith("ToolError: KeyError")
    assert boom.as_message()["role"] == "tool" and boom.as_message()["is_error"] is True

def test_parallel_dispatch_is_concurrent_and_ordered():
    r = Registry()
    @r.tool
    def slow_ping(device_id: str) -> str:
        """Ping a device (slow)."""
        time.sleep(0.2); return f"pong {device_id}"
    calls = [ToolCall("slow_ping", {"device_id": f"D{i}"}, id=f"c{i}") for i in range(5)]
    t0 = time.perf_counter(); res = r.dispatch_parallel(calls); dt = time.perf_counter() - t0
    assert [x.call_id for x in res] == [c.id for c in calls]
    assert [x.content for x in res] == [f"pong D{i}" for i in range(5)]
    assert dt < 0.6, f"took {dt:.2f}s - calls ran one after another"
