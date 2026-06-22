import PageBanner from '../../../components/PageBanner';

const GenericPage = ({ title, description }) => {
  return (
    <div className="bg-gray-50 pb-20 flex-grow">
      <PageBanner 
        title={title}
        description={description}
      />
      
      <div className="container mx-auto px-4 mt-16 max-w-4xl text-center">
        <div className="bg-white rounded-lg shadow-md p-12 border border-gray-100">
           <h2 className="text-3xl font-bold text-gray-400 mb-4">Nội dung đang được cập nhật</h2>
        </div>
      </div>
    </div>
  );
};

export default GenericPage;
