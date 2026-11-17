import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  const team = [
    {
      name: 'Rodilène KENGUE',
      role: 'Fondatrice & Éditrice',
      bio: 'Passionnée de littérature africaine et de récits contemporains.',
      photo: '/team/rodilene.jpeg',
    },
    {
      name: 'Sylviana PEMBA',
      role: 'Rédactrice en chef',
      bio: 'Critique littéraire, il traque les premières plumes prometteuses.',
      photo: '/team/sylviana.png',
    },
  ];

  const values = [
    {
      title: 'La passion des mots',
      text: 'Chaque article est écrit avec soin, par des lecteurs pour des lecteurs.',
    },
    {
      title: 'Une communauté ouverte',
      text: 'Ici, chacun peut partager, commenter et découvrir de nouvelles voix.',
    },
    {
      title: 'La diversité littéraire',
      text: 'Nous mettons en lumière les plumes d\'ici et d\'ailleurs, sans frontières.',
    },
    {
      title: 'La qualité avant tout',
      text: 'Pas de contenu à la chaîne : chaque publication est relue et soignée.',
    },
  ];

  const stats = [
    { value: '+09', label: 'Articles publiés' },
    { value: '+850', label: 'Lecteurs actifs' },
    { value: '+20', label: 'Auteurs' },
    { value: '2026', label: 'Année de création' },
  ];

  return (
    <div className="about">

      {/* ===== HERO ===== */}
      <section className="about-hero">
        <div className="about-hero-content">
          <span className="about-badge">✦ Notre histoire</span>
          <h1 className="about-title">
            Un espace où chaque livre<br />
            <span className="about-accent">trouve sa place.</span>
          </h1>
          <p className="about-subtitle">
            Bookfolio est né d'une idée simple : offrir aux passionnés de lecture
            un lieu paisible pour partager leurs découvertes, leurs coups de cœur
            et leurs réflexions. Ni réseau social bruyant, ni catalogue froid —
            juste des mots, des livres et des gens qui les aiment.
          </p>
        </div>
        <div className="about-hero-visual">
          <img
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=80"
            alt="Livre ouvert"
          />
        </div>
      </section>

      {/* ===== STATISTIQUES ===== */}
      <section className="about-stats">
        {stats.map((stat, i) => (
          <div key={i} className="about-stat">
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </section>

      {/* ===== MISSION ===== */}
      <section className="about-mission">
        <div className="about-section-inner">
          <div className="about-mission-text">
            <h2>Notre mission</h2>
            <p>
              Nous croyons que la lecture est un acte intime mais qui se partage.
              Bookfolio a pour mission de créer un pont entre les lecteurs,
              les auteurs et les œuvres — un espace où la critique est bienveillante,
              où la découverte est guidée, et où chaque voix compte.
            </p>
            <p>
              Nous ne cherchons pas à vendre des livres, mais à faire vivre
              la conversation autour de la littérature. Parce qu'un bon livre
              ne se termine jamais vraiment quand on en parle.
            </p>
          </div>
          <div className="about-mission-quote">
            <blockquote>
              « Un lecteur vit mille vies avant de mourir.
              Celui qui ne lit jamais n'en vit qu'une. »
              <cite>— George R.R. Martin</cite>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ===== VALEURS ===== */}
      <section className="about-values">
        <div className="about-section-header">
          <h2>Ce qui nous guide</h2>
          <p>Quatre principes qui animent chaque article publié sur Bookfolio.</p>
        </div>
        <div className="about-values-grid">
          {values.map((v, i) => (
            <div key={i} className="about-value-card">
              <div className="about-value-icon">{v.icon}</div>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ÉQUIPE ===== */}
      <section className="about-team">
        <div className="about-section-header">
          <h2>Derrière Bookfolio</h2>
          <p>Une petite équipe, une grande passion pour les livres.</p>
        </div>
        <div className="about-team-grid">
          {team.map((member, i) => (
            <div key={i} className="about-team-card">
              <div className="about-team-avatar">
              <img src={member.photo} alt={member.name} />
            </div>
              <h3>{member.name}</h3>
              <span className="about-team-role">{member.role}</span>
              <p>{member.bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="about-cta">
        <div className="about-cta-content">
          <h2>Envie de partager vos lectures ?</h2>
          <p>
            Rejoignez la communauté Bookfolio et commencez à publier
            vos propres articles dès aujourd'hui.
          </p>
          <div className="about-cta-actions">
            <Link to="/register" className="btn btn-primary">
              Créer un compte
            </Link>
            <Link to="/articles" className="btn btn-secondary">
              Découvrir les articles
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;