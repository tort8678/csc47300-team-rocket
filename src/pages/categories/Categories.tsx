import React from 'react';
import { Library, PartyPopper, Briefcase, Gamepad2, MessageSquare } from 'lucide-react';
import '../../styles/categories.css';
import Header from "../../components/header";
import Footer from "../../components/footer";

const Categories: React.FC = () => {

  return (
      <div>
        <Header />

        <main className="container">
          <div className="page-header">
            <h1>Forum Categories</h1>
            <p>Browse all discussion categories and find what interests you</p>
          </div>

          <div className="categories-container">
            {/* Academic */}
            <div className="category-section">
              <h2><Library className="category-icon" size={40}/> Academic</h2>
              <div className="category-list">
                <div className="category-item">
                  <div className="category-info">
                    <h3>Academic Help</h3>
                    <p>Study groups, homework help, and course discussions</p>
                  </div>
                  <div className="category-stats">
                    <div className="stat-item">
                      <span className="stat-value">2,345</span>
                      <span className="stat-label">Threads</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">12,890</span>
                      <span className="stat-label">Posts</span>
                    </div>
                  </div>
                  <div className="latest-post">
                    <span className="latest-label">Latest:</span>
                    <span className="latest-thread">Calculus II Final Prep</span>
                    <span className="latest-user">by john_doe</span>
                    <span className="latest-time">5 mins ago</span>
                  </div>
                </div>

                <div className="category-item">
                  <div className="category-info">
                    <h3>Course Reviews</h3>
                    <p>Share your experiences and review courses</p>
                  </div>
                  <div className="category-stats">
                    <div className="stat-item">
                      <span className="stat-value">1,234</span>
                      <span className="stat-label">Threads</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">8,456</span>
                      <span className="stat-label">Posts</span>
                    </div>
                  </div>
                  <div className="latest-post">
                    <span className="latest-label">Latest:</span>
                    <span className="latest-thread">CS201 with Prof. Smith</span>
                    <span className="latest-user">by tech_student</span>
                    <span className="latest-time">15 mins ago</span>
                  </div>
                </div>

                <div className="category-item">
                  <div className="category-info">
                    <h3>Research &amp; Projects</h3>
                    <p>Collaborate on research and academic projects</p>
                  </div>
                  <div className="category-stats">
                    <div className="stat-item">
                      <span className="stat-value">567</span>
                      <span className="stat-label">Threads</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">3,421</span>
                      <span className="stat-label">Posts</span>
                    </div>
                  </div>
                  <div className="latest-post">
                    <span className="latest-label">Latest:</span>
                    <span className="latest-thread">Looking for research partners</span>
                    <span className="latest-user">by research_fan</span>
                    <span className="latest-time">1 hour ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Campus Life */}
            <div className="category-section">
              <h2><PartyPopper className="category-icon" size={40}/>Campus Life</h2>
              <div className="category-list">
                <div className="category-item">
                  <div className="category-info">
                    <h3>Events &amp; Activities</h3>
                    <p>Campus events, parties, and social gatherings</p>
                  </div>
                  <div className="category-stats">
                    <div className="stat-item">
                      <span className="stat-value">1,823</span>
                      <span className="stat-label">Threads</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">8,432</span>
                      <span className="stat-label">Posts</span>
                    </div>
                  </div>
                  <div className="latest-post">
                    <span className="latest-label">Latest:</span>
                    <span className="latest-thread">Spring Concert Lineup</span>
                    <span className="latest-user">by music_lover</span>
                    <span className="latest-time">20 mins ago</span>
                  </div>
                </div>

                <div className="category-item">
                  <div className="category-info">
                    <h3>Clubs &amp; Organizations</h3>
                    <p>Join and discuss student organizations</p>
                  </div>
                  <div className="category-stats">
                    <div className="stat-item">
                      <span className="stat-value">892</span>
                      <span className="stat-label">Threads</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">4,567</span>
                      <span className="stat-label">Posts</span>
                    </div>
                  </div>
                  <div className="latest-post">
                    <span className="latest-label">Latest:</span>
                    <span className="latest-thread">Photography Club Meeting</span>
                    <span className="latest-user">by shutterbug</span>
                    <span className="latest-time">45 mins ago</span>
                  </div>
                </div>

                <div className="category-item">
                  <div className="category-info">
                    <h3>Sports &amp; Fitness</h3>
                    <p>Intramural sports, gym, and fitness discussions</p>
                  </div>
                  <div className="category-stats">
                    <div className="stat-item">
                      <span className="stat-value">645</span>
                      <span className="stat-label">Threads</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">3,234</span>
                      <span className="stat-label">Posts</span>
                    </div>
                  </div>
                  <div className="latest-post">
                    <span className="latest-label">Latest:</span>
                    <span className="latest-thread">Pickup Basketball Tonight?</span>
                    <span className="latest-user">by hoops_fan</span>
                    <span className="latest-time">2 hours ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Career & Life */}
            <div className="category-section">
              <h2><Briefcase className="category-icon" size={40}/>Career &amp; Life</h2>
              <div className="category-list">
                <div className="category-item">
                  <div className="category-info">
                    <h3>Career &amp; Internships</h3>
                    <p>Job postings, internships, and career advice</p>
                  </div>
                  <div className="category-stats">
                    <div className="stat-item">
                      <span className="stat-value">956</span>
                      <span className="stat-label">Threads</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">4,321</span>
                      <span className="stat-label">Posts</span>
                    </div>
                  </div>
                  <div className="latest-post">
                    <span className="latest-label">Latest:</span>
                    <span className="latest-thread">Summer Internship Tips</span>
                    <span className="latest-user">by career_seeker</span>
                    <span className="latest-time">30 mins ago</span>
                  </div>
                </div>

                <div className="category-item">
                  <div className="category-info">
                    <h3>Housing &amp; Roommates</h3>
                    <p>Find roommates and discuss housing options</p>
                  </div>
                  <div className="category-stats">
                    <div className="stat-item">
                      <span className="stat-value">678</span>
                      <span className="stat-label">Threads</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">3,211</span>
                      <span className="stat-label">Posts</span>
                    </div>
                  </div>
                  <div className="latest-post">
                    <span className="latest-label">Latest:</span>
                    <span className="latest-thread">Looking for Fall Roommate</span>
                    <span className="latest-user">by housing_hunter</span>
                    <span className="latest-time">1 hour ago</span>
                  </div>
                </div>

                <div className="category-item">
                  <div className="category-info">
                    <h3>Buy &amp; Sell</h3>
                    <p>Textbooks, furniture, and other items</p>
                  </div>
                  <div className="category-stats">
                    <div className="stat-item">
                      <span className="stat-value">1,234</span>
                      <span className="stat-label">Threads</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">5,678</span>
                      <span className="stat-label">Posts</span>
                    </div>
                  </div>
                  <div className="latest-post">
                    <span className="latest-label">Latest:</span>
                    <span className="latest-thread">Selling Biology Textbooks</span>
                    <span className="latest-user">by book_seller</span>
                    <span className="latest-time">3 hours ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Entertainment */}
            <div className="category-section">
              <h2><Gamepad2 className="category-icon" size={40}/>Entertainment</h2>
              <div className="category-list">
                <div className="category-item">
                  <div className="category-info">
                    <h3>Gaming</h3>
                    <p>Video games, board games, and gaming meetups</p>
                  </div>
                  <div className="category-stats">
                    <div className="stat-item">
                      <span className="stat-value">1,445</span>
                      <span className="stat-label">Threads</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">9,876</span>
                      <span className="stat-label">Posts</span>
                    </div>
                  </div>
                  <div className="latest-post">
                    <span className="latest-label">Latest:</span>
                    <span className="latest-thread">LAN Party This Weekend</span>
                    <span className="latest-user">by gamer_pro</span>
                    <span className="latest-time">25 mins ago</span>
                  </div>
                </div>

                <div className="category-item">
                  <div className="category-info">
                    <h3>Movies &amp; TV</h3>
                    <p>Discuss movies, TV shows, and streaming</p>
                  </div>
                  <div className="category-stats">
                    <div className="stat-item">
                      <span className="stat-value">789</span>
                      <span className="stat-label">Threads</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">4,567</span>
                      <span className="stat-label">Posts</span>
                    </div>
                  </div>
                  <div className="latest-post">
                    <span className="latest-label">Latest:</span>
                    <span className="latest-thread">What are you watching?</span>
                    <span className="latest-user">by movie_buff</span>
                    <span className="latest-time">50 mins ago</span>
                  </div>
                </div>

                <div className="category-item">
                  <div className="category-info">
                    <h3>Music</h3>
                    <p>Share music, discuss concerts, and find bandmates</p>
                  </div>
                  <div className="category-stats">
                    <div className="stat-item">
                      <span className="stat-value">567</span>
                      <span className="stat-label">Threads</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">2,890</span>
                      <span className="stat-label">Posts</span>
                    </div>
                  </div>
                  <div className="latest-post">
                    <span className="latest-label">Latest:</span>
                    <span className="latest-thread">Looking for Drummer</span>
                    <span className="latest-user">by band_leader</span>
                    <span className="latest-time">4 hours ago</span>
                  </div>
                </div>
              </div>
            </div>

            {/* General */}
            <div className="category-section">
              <h2><MessageSquare className="category-icon" size={40}/>General</h2>
              <div className="category-list">
                <div className="category-item">
                  <div className="category-info">
                    <h3>General Discussion</h3>
                    <p>Random topics and casual conversations</p>
                  </div>
                  <div className="category-stats">
                    <div className="stat-item">
                      <span className="stat-value">3,289</span>
                      <span className="stat-label">Threads</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">18,765</span>
                      <span className="stat-label">Posts</span>
                    </div>
                  </div>
                  <div className="latest-post">
                    <span className="latest-label">Latest:</span>
                    <span className="latest-thread">Coffee Shop Recommendations</span>
                    <span className="latest-user">by caffeine_addict</span>
                    <span className="latest-time">10 mins ago</span>
                  </div>
                </div>

                <div className="category-item">
                  <div className="category-info">
                    <h3>Announcements</h3>
                    <p>Official forum and university announcements</p>
                  </div>
                  <div className="category-stats">
                    <div className="stat-item">
                      <span className="stat-value">123</span>
                      <span className="stat-label">Threads</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">456</span>
                      <span className="stat-label">Posts</span>
                    </div>
                  </div>
                  <div className="latest-post">
                    <span className="latest-label">Latest:</span>
                    <span className="latest-thread">New Forum Guidelines</span>
                    <span className="latest-user">by admin</span>
                    <span className="latest-time">1 day ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
  );
};

export default Categories;