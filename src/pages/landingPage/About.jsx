import React from "react";
import img1 from "../../assets/img/goloop1.png";
import img2 from "../../assets/img/goloop2.png";
import img3 from "../../assets/img/goloop3.png";

function About() {
  return (
    <div>

      <div className="text-center py-12 px-4">
        <h2 className="text-4xl font-bold text-[#334222] mb-4">What We Do?</h2>
        <p className="text-[#334222] text-md font-semibold">
          GoLoop jadi wadah untuk siapa pun yang ingin bantu bersihin sampah di
          jalanan dan ruang publik. <br />
          Kami mengumpulkan relawan & komunitas untuk aksi bersih-bersih, dan
          pastikan sampah dibuang ke TPA resmi.
        </p>
      </div>
    <div
      id="about"
      className="grid grid-cols-1 px-6 md:px-24 md:grid-cols-3 gap-8 pb-12"
    >
      {/* Card 1 */}
      <div className="rounded-[40px] overflow-hidden shadow-lg bg-[#3E532D] text-white">
        <img
          src={img1}
          alt="GoLoop participation"
          className="w-full h-64 object-cover"
        />
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2">GoLoop Participation</h3>
          <p className="text-sm">
            Ikut dalam membersihkan lingkungan tempat kita hidup.
          </p>
        </div>
      </div>

      {/* Card 2 */}
      <div className="rounded-[40px] overflow-hidden shadow-lg bg-[#3E532D] text-white">
        <img
          src={img2}
          alt="Waste Sorting"
          className="w-full h-64 object-cover"
        />
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2">Waste Sorting</h3>
          <p className="text-sm">
            Belajar memilah sampah organik, anorganik, dan B3 agar pengolahan
            lebih efektif & ramah lingkungan.
          </p>
        </div>
      </div>

      {/* Card 3 */}
      <div className="rounded-[40px] overflow-hidden shadow-lg bg-[#3E532D] text-white">
        <img
          src={img3}
          alt="Awareness Increase"
          className="w-full h-64 object-cover"
        />
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-2">Awareness Increase</h3>
          <p className="text-sm">
            Tingkatkan kesadaranmu terhadap sekitar dan jadikan tempat ini layak
            untuk ditinggali.
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}

export default About;
