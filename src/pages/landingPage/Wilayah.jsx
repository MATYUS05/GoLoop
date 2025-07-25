import React from "react";
import gambar3 from "../../assets/img/bg-wilayah-3.svg";

function Wilayah() {
  return (
    <div>
      {/* Section Wilayah */}
      <div
        id="wilayah"
        className="w-full pt-12 h-[600px] px-6 bg-white flex flex-col items-center text-center"
      >
        <h2 className="text-4xl font-bold mb-10 text-[#2C441E]">
          Wilayah dengan Sampah Terbanyak
        </h2>
        <img
          src={gambar3}
          alt="Wilayah Sampah"
          className="w-auto pl-60 h-auto"
        />
      </div>
    </div>
  );
}

export default Wilayah;
