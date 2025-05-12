import React from 'react';
import './About.css';
import { motion } from 'framer-motion';

const team = [
  {
    name: 'Anjali Sharma',
    role: 'Hair Stylist',
    image: 'https://thesalonbusiness.com/wp-content/uploads/2020/06/Rita-Hazan-1024x1024.jpg',
  },
  {
    name: 'Riya Kapoor',
    role: 'Facial Expert',
    image: 'https://www.geetanjalisalon.com/wp-content/uploads/2024/07/Photo-shared-by-Geetanjali-Salon-on-June-25-2024-tagging-@xtanishapuri.-May-be-an-image-of-1-person-long-hair-top-and-text-1024x1024.jpg',
  },
  {
    name: 'Ayesha Khan',
    role: 'Massage Therapist',
    image: 'https://hips.hearstapps.com/hmg-prod/images/halle-berry-attends-to-talk-about-respin-and-her-personal-news-photo-1736968925.pjpeg?crop=0.668xw:1.00xh;0.199xw,0&resize=980:*',
  }
];

const About = () => {
  return (
    <motion.div
      className="about-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <section className="about-hero">
        <h1>Welcome to <span>Glow Salon</span></h1>
        <p>Where beauty meets expertise. Since 2010, we've been providing top-tier salon services with a touch of luxury.</p>
      </section>

      <section className="about-mission">
        <h2>Our Mission</h2>
        <p>
          At Glow Salon, our goal is to empower individuals by enhancing their natural beauty. We prioritize hygiene, comfort, and customer satisfaction above all.
        </p>
      </section>

      <section className="about-team">
        <h2>Meet Our Experts</h2>
        <div className="team-grid">
          {team.map((member, index) => (
            <motion.div
              className="team-card"
              key={index}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <img src={member.image} alt={member.name} />
              <h3>{member.name}</h3>
              <p>{member.role}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="about-why">
        <h2>Why Choose Us?</h2>
        <ul>
          <li>✨ 10+ Years of Excellence</li>
          <li>🧼 Premium Hygiene & Care</li>
          <li>💇‍♀️ Trained & Certified Staff</li>
          <li>🌸 Relaxing Ambience</li>
          <li>💖 Trusted by 3000+ Customers</li>
        </ul>
      </section>

      <div className="cta">
        <button onClick={() => window.location.href = '/book'}>Book Your Experience</button>
      </div>
    </motion.div>
  );
};

export default About;
