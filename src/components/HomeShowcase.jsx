import { useShowcase } from '../apis/showcase';
import defaults from '../data/homeShowcase.defaults.json';
import HomeShowcaseView from './HomeShowcaseView';

const HomeShowcase = () => {
  const { data } = useShowcase();
  return <HomeShowcaseView config={data?.data || defaults} />;
};
export default HomeShowcase;
