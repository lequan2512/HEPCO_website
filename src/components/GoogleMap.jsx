const GoogleMap = () => {
  return (
    <section className="w-full bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Bản đồ vị trí</h2>
          <p className="text-gray-600">Công ty CP Môi trường và Công trình Đô thị Huế (HEPCO)</p>
        </div>
        <div className="w-full h-[450px] rounded-xl overflow-hidden shadow-lg border border-gray-200">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d478.30214414111595!2d107.59154364573497!3d16.45440178297318!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3141a146b5a816c7%3A0xada6cb22654e37cc!2zSEVQQ08gLSBDw7RuZyB0eSBDUCBNw7RpIHRyxrDhu51uZyB2w6AgQ8O0bmcgdHLDrG5oIMSQw7QgdGjhu4sgSHXhur8!5e0!3m2!1svi!2s!4v1785397496081!5m2!1svi!2s"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            title="Bản đồ vị trí HEPCO"
          ></iframe>
        </div>
      </div>
    </section>
  );
};

export default GoogleMap;
