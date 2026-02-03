export const projects = [
  {
    id: "visually-impaired-software",

    title: {
      en: "Software for the Visually Impaired",
      es: "Software para No-videntes",
    },

    shortDescription: {
      en: "Development of an adaptability module for data acquisition software, aimed at visually impaired users.",
      es: "Desarrollo de un módulo de adaptabilidad para un software adquisidor de datos, orientado a usuarios no-videntes.",
    },

    fullDescription: {
      en: `The ArSens Project for the Visually Impaired is an initiative to adapt and develop the ArSens interface, a data acquisition system, to make it 
      accessible for users with visual impairments. ArSens is a software solution developed by members of the regional IEC research lab, which enables 
      the visualization of data and sampling information obtained from a physical data acquisition device, P-rho, also designed and built by the same team. 
      Creating an accessible version for visually impaired users will expand access to a broader audience, fostering greater inclusion in classrooms and 
      university learning environments.`,
      es: `El Proyecto ArSens para no videntes es una propuesta de adaptación y desarrollo de la interfaz ArSens, interfaz de adquisición de datos, para posibilitar su 
      manejo por parte de usuarios con discapacidades visuales. El software ArSens es una solución de software desarrollada por integrantes del laboratorio de 
      investigación regional IEC, que permite la visualización del muestreo e información obtenidos a través de un adquisidor de datos de magnitudes físicas P-rho, 
      también construido y diseñado por el grupo de trabajo en cuestión. La creación de una versión accesible para este tipo de usuarios facilitará su acceso a 
      un mayor espectro de personas, fomentando un mayor nivel de inclusión en las aulas y los ámbitos de aprendizaje universitarios.`,
    },

    features: {
      en: [
        "Text-to-speech feedback for all interface elements",
        "Simplified keyboard navigation with audio cues",
        "Sound-based interface for data visualization",
        "Customizable audio profiles for different user preferences",
      ],
      es: [
        "Retroalimentación de texto a voz para todos los elementos de la interfaz",
        "Navegación simplificada por teclado con señales de audio",
        "Interfaz basada en sonido para visualización de datos",
        "Perfiles de audio personalizables para diferentes preferencias de usuario",
      ],
    },

    technologies: ["Python", "Tkinter", "Google TTS"],
    
    image: {
      en: ["/arsens/arsens-cover-en.png"],
      es: ["/arsens/arsens-cover-es.png"],
    },

    banner: "/arsens/arsens-banner.png",

    video: [
      "/arsens/arsens-demo.mp4",
    ],

    additionalImages: [
      "/arsens/arsens-1.png",
      "/arsens/arsens-2.png",
      "/arsens/arsens-3.png",
      "/arsens/arsens-4.png",
    ],

    tags: {
      en: ["Python", "Accessibility", "Visually Impaired Users"],
      es: ["Python", "Accesibilidad", "Usuarios no-videntes"],
    },

    liveUrl: "#",

    codeUrl: "https://github.com/BaltaMolteni/IEC-ANV",

    year: "2023-Present",
  },

  {
    id: "kinesiology-web-app",

    title: {
      en: "Web App for Kinesiology Center",
      es: "Web App para Centro de Kinesiología",
    },

    shortDescription: {
      en: "Development of a web app using Django + React for a kinesiology center, allowing management of medical records.",
      es: "Desarrollo de web app utilizando Django + React para un centro de kinesiología, permitiendo administrar historias clínicas.",
    },

    fullDescription: {
      en: `Development of a comprehensive web application for kinesiology centers using Django and React. 
      The application allows for efficient management of patient medical records and integrates with other systems to retrieve relevant data 
      for the center.\n\nThe system includes features such as medical record management, patient management, and medical consultation logging, 
      an administrator portal, and a main home page for patients. The application was designed with a focus on user experience,
      ensuring that both staff and patients can navigate the system intuitively.`,

      es: `Desarrollo de una aplicación web integral para centros de kinesiología utilizando Django y React. 
      La aplicación permite una gestión eficiente de historias clínicas de pacientes y se integra con otros sistemas para obtener datos relevantes 
      para el centro.\n\nEl sistema incluye características como manejo de historiales, gestión de pacientes y registro de consultas médicas, 
      un portal para administradores, y un home principal para los pacientes. La aplicación fue diseñada con un enfoque en la experiencia del usuario,
       asegurando que tanto el personal como los pacientes puedan navegar por el sistema de manera intuitiva.`,
    },

    features: {
      en: [
        "Medical history management system",
        "Registration of consultations and medical notes",
        "Patient management",
        "Tracking of treatment plans and progress reports",
        "Integration with external systems"
      ],
      es: [
        "Sistema de gestión de historias clínicas",
        "Registro de consultas y notas médicas",
        "Gestión de paientes",
        "Seguimiento de planes de tratamiento e informes de progreso",
        "Integración con sistemas externos",
      ],
    },

    technologies: ["Django", "React", "Tailwind CSS"],

    image: {
      en: ["/kicenter/kicenter-cover-en.png"],
      es: ["/kicenter/kicenter-cover-es.png"],
    },

    banner: "/kicenter/kicenter-banner.png",

    video: [
      "/kicenter/kicenter-demo.mp4",
    ],

    additionalImages: [
      "/kicenter/home-main.png",
      "/kicenter/kine-consultas.png",
      "/kicenter/kine-pacientes.png",
      "/kicenter/admin-turnos.png",
      "/kicenter/kine-historialclinico.png",
      "/kicenter/login-page.png",
    ],

    tags: {
      en: ["Django", "React", "Full Stack"],
      es: ["Django", "React", "Full Stack"],
    },

    liveUrl: "#",

    codeUrl: "https://github.com/mateogeffroy/KI-APP",

    year: "2024-2025",
  },
]
