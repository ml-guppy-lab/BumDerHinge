import girl1 from './assets/girl 1.webp';
import girl2 from './assets/girl 2.webp';

const profiles = [
  {
    id: 1,
    name: "Ava, 27",
    elements: [
      { type: "photo", url: girl2, caption: "Sunset hiking 👟🌄" },
      { type: "bio", text: "Tea over coffee. Looking for deep convos and goofy adventures!" },
    ]
  },
  {
    id: 2,
    name: "Riya, 25",
    elements: [
      { type: "photo", url: girl1, caption: "Rate pani puri 10/10." },
    ]
  }
];

export default profiles;