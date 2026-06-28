import Landing from "./sections/Landing/Landing.jsx";
import KnowledgeCategories from "./sections/KnowledgeCategories/KnowledgeCategories.jsx";
import FeaturedGuides from "./sections/FeaturedGuides/FeaturedGuides.jsx";
import PromoBanner from "./sections/PromoBanner/PromoBanner.jsx";
import ResourcePicks from "./sections/ResourcePicks/ResourcePicks.jsx";
import ResourceCollections from "./sections/ResourceCollections/ResourceCollections.jsx";
import "./Home.css";

function Home() {
  return (
    <main className="home-page">
      <Landing />
      <KnowledgeCategories />
      <FeaturedGuides />
      <PromoBanner />
      <ResourcePicks />
      <ResourceCollections />
    </main>
  );
}

export default Home;