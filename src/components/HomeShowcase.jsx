import { useShowcase } from '../apis/showcase';
import HomeShowcaseView from './HomeShowcaseView';

const HomeShowcase = () => {
  const { data } = useShowcase();
  if (!data?.data) return null;
  return <HomeShowcaseView config={data.data} />;
};

export default HomeShowcase;
