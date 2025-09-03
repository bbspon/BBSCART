import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { LiaQrcodeSolid } from "react-icons/lia";
import { QRCodeCanvas } from "qrcode.react";
const AppDownloadCTA = () => {
  return (
    <div className="bg-light  border-t  border-red-300  py-9 ">
      <Container className="text-center">
     <div className="flex flex-row items-center justify-between">
       <div>
           <h2 className="fw-bold mb-3">Download the BBSCART App Now</h2>
        <p className="text-muted mb-4">
          Book care, track plans, get instant support — all from your phone.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-4 py-6">
          <a
            href="https://play.google.com/store/apps/details?id=com.bbscart.app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/img/hero/playstore.png"
              alt="Get it on Google Play"
              className="h-[100px] w-[220px] object-contain"
            />
          </a>

          <a
            href="https://apps.apple.com/app/id0000000000"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/img/hero/app.svg"
              alt="Download on the App Store"
              className="h-[60px] w-[180px] object-contain"
            />
          </a>
        </div>
        <div>
          <p className="text-muted">
            By downloading the app, you agree to the{" "}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </p>
        </div>
       </div>
       <div className="border-2 border-gray-300 rounded-2xl flex flex-col items-center p-4">
      <QRCodeCanvas
        value="https://facebook.com"
        size={180} // QR size
        bgColor="#ffffff"
        fgColor="#000000"
        level="H" // high error correction
        includeMargin={true}
      />
      <p className="text-muted fw-bold mt-3 mb-5">Scan to download</p>
    </div>
     </div>
      </Container>
    </div>
  );
};

export default AppDownloadCTA;
