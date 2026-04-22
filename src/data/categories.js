import { LampDesk, Image as ImageIcon, Sparkles } from 'lucide-react';

export const categories = [
  {
    id: 'lampi-3d',
    slug: 'lampi-3d',
    name: 'Lămpi 3D',
    description: 'Lămpi parametrice printate 3D, personalizabile în funcție de spațiul tău. Oferă o lumină caldă, ambientală și un design unic.',
    icon: LampDesk,
    hasCustomizer: true,
    image: '/lamp-produce-carousel.png'
  },
  {
    id: 'poze-litografice',
    slug: 'poze-litografice',
    name: 'Poze Litografice',
    description: 'Transformă amintirile dragi în opere de artă luminate. Printate 3D cu precizie milimetrică pentru a prinde viață atunci când sunt iluminate prin spate.',
    icon: ImageIcon,
    hasCustomizer: false,
    image: '/litofanie-produce-carousel.jpg'
  },
  {
    id: 'tablouri-fire',
    slug: 'tablouri-fire',
    name: 'Tablouri cu Fire',
    description: 'Design procedural și de ultimă generație. Un singur fir continuu țese o imagine geometrică impresionantă pe un cadru circular elegant.',
    icon: Sparkles,
    hasCustomizer: false,
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&q=80&w=1000'
  }
];
