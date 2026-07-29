import {
  FiFacebook,
  FiInstagram,
  FiMail,
  FiPhone,
  FiTwitter,
} from "react-icons/fi";

import {
  FaTiktok,
  FaWhatsapp,
} from "react-icons/fa6";

import "./Contact.css";

const contactDetails = {
  email: "info@skillvault.co.ke",
  phone: "+254 790 648 219",
  phoneHref: "+254790648219",
  whatsappHref:
    "https://wa.me/254790648219",
};

const socialLinks = [
  {
    label: "Instagram",
    handle: "@skillvault",
    href: "https://www.instagram.com/skillvault",
    icon: FiInstagram,
  },
  {
    label: "Facebook",
    handle: "SkillVault",
    href: "https://www.facebook.com/skillvault",
    icon: FiFacebook,
  },
  {
    label: "TikTok",
    handle: "@skillvault",
    href: "https://www.tiktok.com/@skillvault",
    icon: FaTiktok,
  },
  {
    label: "X / Twitter",
    handle: "@skillvault",
    href: "https://x.com/skillvault",
    icon: FiTwitter,
  },
];

function Contact() {
  return (
    <main className="contact-v2-page">
      <section className="contact-v2-section">
        <div className="contact-v2-container contact-v2-layout">
          <div className="contact-v2-image">
            <img
              src="https://images.pexels.com/photos/7382385/pexels-photo-7382385.jpeg?auto=compress&cs=tinysrgb&w=1400"
              alt="Smiling Black woman using a tablet"
            />

            <div className="contact-v2-image-note">
              <span>Customer support</span>

              <strong>
                We are happy to help
              </strong>
            </div>
          </div>

          <div className="contact-v2-content">
            <span className="contact-v2-eyebrow">
              Contact us
            </span>

            <h1>
              Let&apos;s help you find what you need
            </h1>

            <p>
              Reach out with questions about resources,
              purchases, downloads, or account access.
            </p>

            <div className="contact-v2-details">
              <a
                href={`mailto:${contactDetails.email}`}
                className="contact-v2-detail"
              >
                <span>
                  <FiMail aria-hidden="true" />
                </span>

                <div>
                  <small>Email</small>
                  <strong>
                    {contactDetails.email}
                  </strong>
                </div>
              </a>

              <a
                href={`tel:${contactDetails.phoneHref}`}
                className="contact-v2-detail"
              >
                <span>
                  <FiPhone aria-hidden="true" />
                </span>

                <div>
                  <small>Call us</small>
                  <strong>
                    {contactDetails.phone}
                  </strong>
                </div>
              </a>

              <a
                href={contactDetails.whatsappHref}
                className="contact-v2-detail"
                target="_blank"
                rel="noreferrer"
              >
                <span>
                  <FaWhatsapp aria-hidden="true" />
                </span>

                <div>
                  <small>WhatsApp</small>
                  <strong>
                    Chat with SkillVault
                  </strong>
                </div>
              </a>
            </div>

            <div className="contact-v2-socials">
              <div>
                <span>Follow SkillVault</span>

                <p>
                  Stay updated on new resources and
                  practical learning content.
                </p>
              </div>

              <div className="contact-v2-social-grid">
                {socialLinks.map((social) => {
                  const Icon = social.icon;

                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open SkillVault on ${social.label}`}
                    >
                      <span>
                        <Icon aria-hidden="true" />
                      </span>

                      <div>
                        <strong>
                          {social.label}
                        </strong>

                        <small>
                          {social.handle}
                        </small>
                      </div>
                    </a>
                  );
                })}
              </div>
            </div>

            <p className="contact-v2-note">
              Support messages are answered during normal
              business hours.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Contact;
