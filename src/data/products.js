export const products = [
  // Lămpi 3D
  {
    id: 'lampa-geometrica-v1',
    name: 'Lampă Geometrică "Nova"',
    categoryId: 'lampi-3d',
    price: 180.00,
    description: 'Lampă cu design geometric modern, printată 3D dintr-un material biodegradabil (PLA). Textura suprafeței creează un joc de lumini subtil.',
    specs: {
      material: 'PLA Premium',
      dimensiuni: '15cm x 15cm x 20cm',
      sursa_lumina: 'LED Cald 5W inclus'
    },
    inStock: true,
    isCustomizable: false,
    image: '/lamp-produce-carousel.png'
  },
  {
    id: 'lampa-organica',
    name: 'Lampă Organică "Flora"',
    categoryId: 'lampi-3d',
    price: 210.00,
    description: 'Inspirată din natură, această lampă are curbe organice care dispersează lumina într-un mod unic, imitând un boboc de floare.',
    specs: {
      material: 'PETG Reciclat',
      dimensiuni: '18cm x 18cm x 22cm',
      sursa_lumina: 'LED Dimmable 7W'
    },
    inStock: true,
    isCustomizable: false,
    image: 'https://images.unsplash.com/photo-1507675971485-f5bb530a6de4?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'lampa-diy',
    name: 'Creează-ți propria Lampă',
    categoryId: 'lampi-3d',
    price: 250.00,
    description: 'Folosește configuratorul nostru 3D pentru a-ți genera propria lampă parametrică. Ajustează dimensiunea, forma și modelul.',
    specs: {
      material: 'La alegere (PLA/PETG)',
      dimensiuni: 'Customizabil',
      sursa_lumina: 'Standard E27 LED'
    },
    inStock: true,
    isCustomizable: true,
    image: 'https://images.unsplash.com/photo-1524592714635-d77511a4834b?auto=format&fit=crop&q=80&w=800'
  },

  // Poze Litografice
  {
    id: 'litofanie-clasica',
    name: 'Litofanie Personalizată Curubată',
    categoryId: 'poze-litografice',
    price: 120.00,
    description: 'Lumina dă viață amintirilor. Încărcați o poză și noi o transformăm într-un ecran curbat iluminat din spate.',
    specs: {
      material: 'PLA Alb Mat',
      dimensiuni: '15cm x 10cm curbat',
      rezolutie: '0.1mm layer height'
    },
    inStock: true,
    isCustomizable: false,
    image: 'https://images.unsplash.com/photo-1551028719-0141db012411?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'litofanie-cutie',
    name: 'Cutie Luminoasă Litografică',
    categoryId: 'poze-litografice',
    price: 240.00,
    description: 'Un cub ce prezintă 4 litofanii diferite (sau 3 și o ușă). O piesă centrală perfectă pentru birou, funcționează la baterie.',
    specs: {
      material: 'PLA + Componente Electronice',
      dimensiuni: '12cm x 12cm x 12cm',
      baterie: 'USB Inclus'
    },
    inStock: true,
    isCustomizable: false,
    image: 'https://images.unsplash.com/photo-1510255404179-c533e4612330?auto=format&fit=crop&q=80&w=800'
  },

  // Tablouri Fire
  {
    id: 'tablou-fire-portret',
    name: 'String Art: Portret',
    categoryId: 'tablouri-fire',
    price: 350.00,
    description: 'Un portret realizat dintr-un singur fir continuu pe un cadru de aluminiu printat 3D. Generat algoritmic pentru precizie uimitoare.',
    specs: {
      cadru: 'Aluminiu',
      fir: 'Bumbac rezistent, culoare negră',
      diametru: '50cm',
      numar_pini: 250
    },
    inStock: true,
    isCustomizable: false,
    image: 'https://images.unsplash.com/photo-1551103782-8ab07afd45c1?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'tablou-fire-monument',
    name: 'String Art: Geometric/Logo',
    categoryId: 'tablouri-fire',
    price: 450.00,
    description: 'Reproducem un logo, un patern geometric sau o cladire emblematica printr-o rețea complexă de fire. Design la comandă.',
    specs: {
      cadru: 'Lemn sau Aluminiu la alegere',
      fir: 'Culori multiple disponibile',
      diametru: 'Până la 80cm',
      numar_pini: 300
    },
    inStock: true,
    isCustomizable: false,
    image: 'https://images.unsplash.com/photo-1506484381205-f7945653044d?auto=format&fit=crop&q=80&w=800'
  }
];
