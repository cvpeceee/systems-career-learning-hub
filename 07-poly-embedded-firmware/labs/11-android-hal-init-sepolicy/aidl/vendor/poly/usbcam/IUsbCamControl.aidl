// Stable AIDL vendor HAL interface (Treble: framework talks to vendor only through versioned interfaces).
package vendor.poly.usbcam;
@VintfStability
interface IUsbCamControl {
    /** Switch the USB gadget personality, e.g. "uvc,uac2" or "uvc,uac2,adb". */
    void setUsbFunctions(in String functions);
    String getUsbFunctions();
    /** Returns current UVC stream state for diagnostics. */
    boolean isStreaming();
}
