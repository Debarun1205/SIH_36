import QRCode from "qrcode";

/**
 * Generates a QR code as a base64 data URL encoding a verification link.
 * @param {string} type - "shop" | "instrument" | "certificate"
 * @param {string} id - the qrId / certificateId
 */
export const generateQR = async (type, id) => {
  const baseUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const verifyUrl = `${baseUrl}/verify/${type}/${id}`;
  const dataUrl = await QRCode.toDataURL(verifyUrl, {
    errorCorrectionLevel: "M",
    margin: 2,
    width: 300,
  });
  return dataUrl;
};
