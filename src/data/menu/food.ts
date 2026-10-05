/** Food menu — transcribed from spec Appendix A.1 (content bible §6). Prices in cents. */
import { COPY } from "@/data/venue";
import type { Menu, MenuItem, Price } from "./types";

export const CBP = "Chicken, beef or pork";
const c = (dollars: number) => Math.round(dollars * 100);
/** One unlabelled price. */
const one = (dollars: number): Price[] => [{ cents: c(dollars) }];
/** Labelled tiers: [label, dollars, "W"?]. */
const tiers = (...t: Array<[string, number] | [string, number, "W"]>): Price[] =>
  t.map(([label, dollars, w]) => (w ? { label, cents: c(dollars), source: w } : { label, cents: c(dollars) }));

const LUNCH_OC = "C-8: repo lunch prices (~$1 above grapow.net)";
const lunch = (id: string, name: string, dollars: number, extra: Partial<MenuItem> = {}): MenuItem =>
  ({ id, name, prices: one(dollars), priceSource: "G", ownerConfirm: LUNCH_OC, ...extra }); // OWNER-CONFIRM(C-8): repo lunch prices (~$1 above grapow.net)
const noodleLunch = (id: string, name: string, dollars: number, extra: Partial<MenuItem> = {}): MenuItem =>
  ({ id, name, prices: one(dollars), priceSource: "G", ...extra });

const TOM_YUM = "Lemon grass hot and sour soup with mushroom, onion, and tomatoes.";
const TOM_KHA = "Lemon grass coconut soup with mushroom.";

export const FOOD: Menu = {
  id: "food",
  title: "Food",
  href: "/menu/food",
  ground: "rice",
  notes: [COPY.allergyNote, COPY.priceNote],
  sections: [
    {
      id: "lunch", title: "Lunch specials", layout: "compact", window: "lunch",
      note: "Served daily until 3 PM. All lunch specials are served with salad, chicken dumpling, fried wonton, and your choice of steamed white or brown rice, or fried rice. Substitute items for an additional cost.",
      items: [
        lunch("lunch-cashew-chicken", "Cashew Chicken", 18),
        lunch("lunch-orange-chicken", "Orange Chicken", 18),
        lunch("lunch-bbq", "B.B.Q. Chicken, Beef or Pork", 18),
        lunch("lunch-gra-pow", "Gra/Pow Chicken or Beef", 18, { spicy: true, aliases: ["pad gra pow lunch"] }),
        lunch("lunch-yellow-curry-chicken", "Yellow Curry Chicken", 18),
        lunch("lunch-red-curry-beef", "Red Curry Beef", 18, { spicy: true }),
        lunch("lunch-eggplant-tofu", "Eggplant & Tofu", 18, { spicy: true }),
        lunch("lunch-mixed-vegetable-tofu", "Mixed Vegetable & Tofu", 18),
        lunch("lunch-garlic-pepper-beef", "Garlic & Pepper Beef", 18),
        lunch("lunch-green-bean-chicken", "Green Bean Chicken", 18),
        lunch("lunch-teriyaki-chicken", "Teriyaki Chicken", 18),
        lunch("lunch-broccoli-beef", "Broccoli & Beef", 18),
        lunch("lunch-kung-pao-chicken", "Kung Pao Chicken", 20, { spicy: true }),
        lunch("lunch-mongolian-beef", "Mongolian Beef", 20),
        lunch("lunch-ny-steak", "NY Steak with Garlic Sauce", 22),
        lunch("lunch-salmon-teriyaki", "Salmon with Teriyaki Sauce", 22),
      ],
    },
    {
      id: "noodle-lunch", title: "Noodle lunch", layout: "compact", window: "lunch",
      note: "Served daily until 3 PM. Rice is not included with noodle lunch specials. Substitute items for an additional cost.",
      items: [
        noodleLunch("lunch-gra-pow-noodle", "Gra-Pow Noodle Chicken", 20, { spicy: true }),
        noodleLunch("lunch-chow-mein", "Chow Mein Noodle (Beef or Chicken)", 20),
        noodleLunch("lunch-pho", "Pho Noodle Soup", 18),
        noodleLunch("lunch-bbq-pork-noodle-soup", "BBQ Pork with Noodle Soup and Wonton", 18),
        noodleLunch("lunch-pad-see-aew", "Pad See Aew Chicken", 18),
        noodleLunch("lunch-pad-thai", "Pad Thai Chicken", 18),
        noodleLunch("lunch-seafood-noodle", "Seafood Noodle", 21, { spicy: true }),
        noodleLunch("lunch-spicy-sour-noodle-soup", "Spicy & Sour Noodle Soup", 20, { minSpice: 5 }),
      ],
    },
    {
      id: "appetizers", title: "Appetizers", layout: "list",
      items: [
        { id: "satay-chicken", name: "Satay Chicken", prices: one(15), priceSource: "W", description: "Grilled chicken on a skewer marinated with special curry powder, served with cucumber sauce and world-famous peanut sauce." },
        { id: "steamed-shrimp-dumpling", name: "Steamed Shrimp Dumpling", prices: one(16), priceSource: "W", description: "Steamed shrimp wrapped in rice paper. Served with sweet sesame wine soy sauce. (8)" },
        { id: "lettuce-wrap", name: "Lettuce Wrap", prices: one(15), priceSource: "W", description: "Ground chicken stir-fried with Thai seasoning, served with chilled lettuce and GraPow! signature sauce." },
        { id: "dragon-wings", name: "Dragon Wings", prices: one(15), priceSource: "W", description: "Deep-fried wings coated with spicy Szechuan delicious red wine sauce. (8)", aliases: ["wings", "chicken wings"] },
        { id: "steamed-sue-mai", name: "Steamed Sue-Mai", prices: one(14), priceSource: "W", description: "Ground pork and shrimp marinated, wrapped with wonton skin then steamed, served with wine sesame soy sauce. (8)", aliases: ["shumai", "siu mai"] },
        { id: "tuna-tar-tar", name: "Tuna Tar Tar", prices: one(16), priceSource: "W", description: "Marinated fresh tuna with spicy Japanese tar tar sauce, served with a toasted baguette.", aliases: ["tuna tartare"] },
        { id: "egg-rolls", name: "Egg Rolls (5)", prices: one(12), priceSource: "G", description: "Cabbage, celery, and clear noodles deep-fried, served with a sweet & sour sauce." },
        // Contains shrimp: never vegetarian.
        { id: "fresh-spring-roll", name: "Fresh Spring Roll", prices: one(15), priceSource: "G", description: "Vietnamese-style fresh green leaf, mint leaves, bean sprouts, rice noodle, and shrimp, served with peanut curry sauce." },
        { id: "dumplings", name: "Dumplings (10)", prices: one(14), priceSource: "G", description: "Steamed and pan-fried, stuffed with chicken & vegetable, served with wine sesame soy sauce." },
        { id: "fantastic-four", name: "Fantastic Four", prices: one(23), priceSource: "G", description: "A combination plate of satay chicken (3), egg rolls (2), dumplings (4) and steamed sue-mai (3), served with their own sauces." },
        { id: "deep-fried-calamari", name: "Deep Fried Calamari", prices: one(17), priceSource: "G", description: "Calamari coated with tempura flour and deep-fried, served with a hot sweet & sour sauce." },
        { id: "chicken-slammer", name: "Chicken Slammer (8)", prices: one(15), priceSource: "G", description: "Deep-fried flour pastry stuffed with seasoned ground chicken, served with cucumber sweet & sour sauce." },
        { id: "chips-thai-salsa", name: "Chips & Thai Salsa", prices: one(13), priceSource: "G" },
        { id: "thai-tacos", name: "Thai Tacos (3)", prices: one(14), priceSource: "G", description: "Beef and shrimp, served with spicy taco sauce & sriracha mayo." },
        { id: "cream-cheese-wontons", name: "Cream Cheese Wontons with Pineapple (6)", prices: one(11), priceSource: "G" },
        { id: "edamame", name: "Edamame", prices: tiers(["Regular", 10], ["Spicy garlic", 11]), priceSource: "G" },
      ],
    },
    {
      id: "soup", title: "Soup", layout: "table", tierLabels: ["Small", "Large"],
      items: [
        { id: "tom-yum-chicken", name: "Tom Yum (hot & sour) — Chicken", prices: tiers(["Small", 12.5], ["Large", 16.5]), priceSource: "G", description: TOM_YUM, aliases: ["tom yam"] },
        { id: "tom-yum-shrimp", name: "Tom Yum (hot & sour) — Shrimp", prices: tiers(["Small", 13.5], ["Large", 17.5]), priceSource: "G", description: TOM_YUM, aliases: ["tom yam"] },
        { id: "tom-yum-seafood", name: "Tom Yum (hot & sour) — Seafood", prices: tiers(["Small", 15], ["Large", 22.5]), priceSource: "G", description: TOM_YUM, aliases: ["tom yam"] },
        { id: "tom-kha-chicken", name: "Tom Kha (coconut) — Chicken", prices: tiers(["Small", 12.75], ["Large", 17]), priceSource: "G", description: TOM_KHA, aliases: ["tom kar"] },
        { id: "tom-kha-shrimp", name: "Tom Kha (coconut) — Shrimp", prices: tiers(["Small", 13.75], ["Large", 18]), priceSource: "G", description: TOM_KHA, aliases: ["tom kar"] },
        { id: "buddha-shrimp-wonton-soup", name: "Buddha Shrimp Wonton Soup", prices: tiers(["Small", 14], ["Large", 20]), priceSource: "G", description: "Shrimp wonton in a clear soup with vegetables." },
        { id: "thai-rice-soup", name: "Thai Rice Soup", prices: tiers(["Small", 13], ["Large", 17]), priceSource: "G", description: "Steamed white rice in a clear soup with shrimp, chicken and fried tofu." },
        { id: "tofu-clear-noodle-soup", name: "Tofu & Clear Noodle Soup", prices: tiers(["Small", 13], ["Large", 17]), priceSource: "G", description: "Vegetables, tofu, and clear noodles in a clear soup." },
        { id: "miso-soup", name: "Miso Soup", prices: tiers(["Small", 9.5], ["Large", 14.5]), priceSource: "G", description: "Tofu, mushroom, seaweed, and green onion." },
      ],
    },
    {
      id: "salad", title: "Salad", layout: "list",
      items: [
        { id: "house-green-salad", name: "House Green Salad", prices: tiers(["Small", 9], ["Large", 13]), priceSource: "G", description: "Green garden salad with a choice of house lemon green dressing, Japanese miso dressing, or peanut sauce dressing." },
        { id: "larb", name: "Larb", prices: one(19), priceSource: "G", description: "Famous eastern ground beef salad with red and green onion, roasted rice powder and native spices in a spicy lime sauce.", aliases: ["laab", "larp"] },
        { id: "green-papaya-salad", name: "Green Papaya Salad", prices: one(18), priceSource: "G", description: "Shredded green papaya mixed in garlic chili lime sauce with dried shrimp, green beans, tomato, and ground peanuts. Try it with stir-fried sweet soy sauce vermicelli — add $2.00.", aliases: ["papaya salad", "som tum"] },
        { id: "seared-tuna-salad", name: "Seared Tuna Salad", prices: one(23), priceSource: "G", description: "Seared fresh tuna with spicy creamy sauce and a green salad with sesame miso dressing." },
      ],
    },
    {
      id: "entrees", title: "Entrées", layout: "list",
      note: "All entrées are served with your choice of white, brown, or fried rice. Chow mein or steamed veggies are available for an additional cost.",
      items: [
        { id: "pad-gra-pow", name: "Pad Gra Pow", prices: [{ cents: c(22) }, { label: "With fried egg", cents: c(23) }], priceSource: "G", spicy: true, description: "Ground chicken or beef served with bell pepper, onion, and Thai basil in spicy chili garlic sauce.", aliases: ["pad kra pao", "kra pao", "krapow", "basil chicken"] },
        { id: "cashew-chicken", name: "Cashew Chicken", prices: one(22), priceSource: "G", description: "With onion, carrot, and water chestnut." },
        { id: "broccoli-cauliflower", name: "Broccoli & Cauliflower", prices: tiers([CBP, 22], ["Shrimp", 24], ["Combination", 26.5]), priceSource: "G", description: "Broccoli, cauliflower, carrot, and mushroom stir-fried with oyster sauce." },
        { id: "orange-chicken", name: "Orange Chicken", prices: one(23), priceSource: "G", description: "Deep-fried chicken in sweet & sour orange sauce topped with sesame seeds." },
        { id: "garlic-black-pepper", name: "Garlic Black Pepper", prices: tiers([CBP, 22], ["Shrimp", 24, "W"], ["Combination", 26.5, "W"]), priceSource: "G", description: "Stir-fried in a garlic and pepper sauce with onion, bell pepper, zucchini, and green beans." },
        { id: "green-beans", name: "Green Beans", prices: one(22), priceSource: "G", description: "Stir-fried green beans and eggs, with slices of chicken." },
        { id: "bbq-chicken", name: "B.B.Q. Chicken", prices: one(23), priceSource: "G", description: "Marinated chicken breast grilled and served in Thai B.B.Q. sauce. (Served with a side salad)" },
        { id: "bbq-pork", name: "B.B.Q. Pork", prices: one(23), priceSource: "G", description: "Pork loin marinated in Thai B.B.Q. sauce. (Served with a side salad)" },
        { id: "bbq-beef", name: "B.B.Q. Beef", prices: one(23), priceSource: "G", description: "Korean-style marinated boneless B.B.Q. beef. (Served with a side salad)" },
        { id: "teriyaki-chicken", name: "Teriyaki Chicken", prices: one(23), priceSource: "G", description: "Marinated chicken breast grilled, served with teriyaki sauce. (Served with a side salad)" },
        { id: "ny-steak", name: "NY Steak", prices: one(30), priceSource: "G", description: "Grilled New York steak with garlic sauce, veggies, and fried tempura. (Served with a side salad)" },
        { id: "crying-tiger-steak", name: "Crying Tiger Steak", prices: one(30), priceSource: "G", spicy: true, pe2019: true, description: "Grilled New York steak with spicy eastern-style Thai sauce, and vegetables." },
        { id: "eggplant", name: "Eggplant", prices: tiers(["Tofu", 21], [CBP, 22], ["Shrimp", 24], ["Combination", 25.5, "W"]), priceSource: "G", spicy: true, description: "Stir-fried Japanese eggplant with chili & garlic, bell pepper, onion, and basil leaves." },
        { id: "mixed-vegetable", name: "Mixed Vegetable", prices: tiers(["Tofu", 21], [CBP, 22], ["Shrimp", 24, "W"], ["Combination", 25.5, "W"]), priceSource: "G", description: "Stir-fried mixed vegetables." },
        { id: "mongolian-beef", name: "Mongolian Beef", prices: one(23), priceSource: "G", description: "Marinated beef stir-fried in oyster sauce with onion, mushroom, green onion, and leeks.", ownerConfirm: "C-8: $23 (repo) vs $21 (grapow.net)" }, // OWNER-CONFIRM(C-8): Mongolian Beef $23 (repo) vs $21 (grapow.net)
        { id: "pad-pik-king", name: "Pad Pik King", prices: tiers([CBP, 22]), priceSource: "G", ownerConfirm: "C-9: repo-only item — still on the menu?" }, // OWNER-CONFIRM(C-9): repo-only item — still on the menu?
        { id: "kung-pao", name: "Kung Pao", prices: tiers(["Tofu", 21], [CBP, 22], ["Shrimp", 22, "W"]), priceSource: "G", spicy: true, description: "Bell peppers, onion, celery, water chestnut, carrot, zucchini, and peanuts with a blazing sauce of chilies.", ownerConfirm: "C-8: shrimp price equals meat; grapow.net lists 19/20/22" }, // OWNER-CONFIRM(C-8): Kung Pao tiers — shrimp equals meat; grapow.net lists 19/20/22
        { id: "gra-pow-seafood", name: "Gra/Pow Seafood", prices: one(30), priceSource: "G", pe2019: true, description: "Shrimp, crab, squid, clam, mussels, and fish, all mixed in Thai spicy herbs.", aliases: ["hot plate", "seafood hot plate"] },
        { id: "salmon", name: "Salmon", prices: one(29), priceSource: "G", description: "Grilled salmon with a choice of teriyaki, orange, or garlic sauce on top of assorted veggies. (Served with a side salad)" },
        { id: "kung-pik-pow", name: "Kung Pik Pow", prices: one(26), priceSource: "G", pe2019: true, description: "One of the most popular customer choices. Shrimp stir-fried in roasted curry paste, cashews, onion, water chestnut, and bell pepper." },
      ],
    },
    {
      id: "curry", title: "Curry", layout: "list",
      items: [
        { id: "red-curry", name: "Red Curry", prices: tiers(["Tofu", 21], [CBP, 22], ["Shrimp", 24]), priceSource: "G", minSpice: 5, description: "Bamboo shoots, green beans, bell pepper, eggplant, and Thai basil." },
        { id: "chicken-yellow-curry", name: "Chicken Yellow Curry", prices: one(22.5), priceSource: "G", description: "Slices of chicken, potatoes, and carrot in yellow coconut milk curry." },
        { id: "young-coconut-green-curry", name: "Young Coconut Green Curry", prices: tiers(["Tofu", 21], [CBP, 22], ["Shrimp", 24]), priceSource: "G", minSpice: 5, description: "Bamboo shoots, green beans, bell pepper, eggplant, Thai basil and young coconut meat.", ownerConfirm: "C-8: tofu $21 vs a stale $19 on grapow.net" }, // OWNER-CONFIRM(C-8): Young Coconut tofu $21 vs a stale $19 on grapow.net
        { id: "panang-curry", name: "Panang Curry", prices: tiers(["Tofu", 21], [CBP, 22], ["Shrimp", 24]), priceSource: "G", minSpice: 2, description: "Thai curry with bell pepper, peas, and carrots.", aliases: ["panange", "penang"] },
      ],
    },
    {
      id: "noodles", title: "Noodles", layout: "list",
      items: [
        { id: "pad-thai", name: "Pad Thai", prices: tiers([CBP, 22], ["Shrimp", 24], ["Combination", 26.5]), priceSource: "W", description: "Sweet & sour noodles with egg, bean sprouts and green onion, garnished with red and green cabbage, shredded carrot and ground peanuts." },
        { id: "gra-pow-noodle", name: "Gra/Pow Noodle", prices: tiers([CBP, 22], ["Shrimp", 24], ["Combination", 26.5]), priceSource: "W", spicy: true, description: "“Drunken noodles”: spicy flat rice noodles with bell pepper, Thai basil, white and green onion, and carrots, topped with crunchy noodles.", aliases: ["drunken noodles"] },
        { id: "pad-woon-sen", name: "Pad Woon Sen", prices: tiers([CBP, 22], ["Shrimp", 24], ["Combination", 26.5]), priceSource: "W", description: "Thin glass noodles with egg and vegetables." },
        { id: "pad-see-aew", name: "Pad See Aew", prices: tiers([CBP, 22], ["Shrimp", 24], ["Combination", 26.5]), priceSource: "W", description: "Flat rice noodles with Chinese broccoli, American broccoli, and bean sprouts, topped with crunchy noodles.", aliases: ["pad see ew", "see ew"] },
        { id: "eight-warriors-noodles", name: "Eight Warriors Noodles", prices: one(25), priceSource: "W", description: "Four kinds of meat (chicken, beef, pork & shrimp) stir-fried with clear noodles and four kinds of vegetables: Chinese cabbage, snow peas, celery, and zucchini. (Served with choice of rice)" },
        { id: "asian-noodles", name: "Asian Noodles", prices: one(23), priceSource: "G", spicy: true, description: "Chicken and calamari stir-fried with egg, flat noodles, onion, bean sprouts, and spicy seasoning, served on top of lettuce with chopped peanuts. Topped with crunchy noodles." },
        { id: "garlic-noodles", name: "Garlic Noodles", prices: tiers([CBP, 22], ["Shrimp", 24, "W"], ["Combination", 26.5, "W"]), priceSource: "G", description: "Meat is deep-fried, topped with crunchy noodles." },
        { id: "chow-mein-noodles", name: "Chow Mein Noodles", prices: tiers([CBP, 22], ["Shrimp", 24], ["Combination", 26.5]), priceSource: "G", description: "Stir-fried egg noodles with mixed vegetables, Chinese style." },
        { id: "pho-noodles", name: "Pho Noodles", prices: tiers([CBP, 22], ["Shrimp", 24], ["Combination", 26.5]), priceSource: "G", description: "Vietnamese-style noodle soup with bean sprouts, basil, jalapeños, cilantro, and lemon." },
        { id: "bbq-pork-noodle-soup", name: "B.B.Q. Pork Noodle Soup", prices: one(22), priceSource: "G", description: "Yellow egg noodles and shrimp wonton with bean sprouts, green onion, and B.B.Q. pork." },
      ],
    },
    {
      id: "rice", title: "Rice", layout: "list",
      items: [
        { id: "wok-fried-rice", name: "Wok Fried Rice", prices: tiers([CBP, 21.5], ["Shrimp", 23.5], ["Combination", 25, "W"]), priceSource: "G", description: "Stir-fried rice with egg, green onion, white onion, peas, and carrots." },
        { id: "seafood-fried-rice", name: "Seafood Fried Rice", prices: one(28), priceSource: "G", description: "Fried rice with mixed seafood, onion, Chinese and American broccoli." },
        { id: "golden-pineapple-fried-rice", name: "Golden Pineapple Fried Rice", prices: one(24), priceSource: "G", description: "Stir-fried rice with egg, chicken, shrimp, onion, roasted cashew nuts, pineapple, and raisins in curry powder." },
        { id: "dragon-fried-rice", name: "Dragon Fried Rice", prices: tiers([CBP, 21.5], ["Shrimp", 23.5, "W"], ["Combination", 26, "W"]), priceSource: "G", description: "Spicy stir-fried steamed rice with Thai spices, peas, carrots, bell pepper, white onion, and green onion." },
        { id: "crab-meat-fried-rice", name: "Crab Meat Fried Rice", prices: one(27), priceSource: "G", description: "Stir-fried white rice with lumps of crab meat, egg, onion, and tomatoes." },
      ],
    },
    {
      id: "specials", title: "Specials", layout: "list",
      items: [
        { id: "cajun-seafood-boil", name: "Cajun Seafood Boil", prices: tiers(["Shrimp", 25], ["Crab", 55], ["Shrimp & crab combination", 45]), priceSource: "G" },
        { id: "seafood-boil-add-ons", name: "Seafood boil add-ons", prices: tiers(["Corn", 3], ["Sausage", 5], ["Potato", 3]), priceSource: "G" },
        { id: "pork-ramen", name: "Pork Ramen", prices: one(21), priceSource: "G", description: "Pork belly, broccoli, egg, bean sprouts and bamboo with chicken broth." },
      ],
    },
    {
      id: "sides", title: "Sides", layout: "compact",
      items: [
        { id: "side-steamed-rice", name: "Steamed White or Brown Rice", prices: one(5), priceSource: "G" },
        { id: "side-fried-rice", name: "Fried Rice", prices: one(6), priceSource: "G" },
        { id: "side-sticky-rice", name: "Sticky Rice", prices: one(6), priceSource: "G" },
        { id: "side-steamed-vegetable", name: "Steamed Vegetable", prices: one(7), priceSource: "G" },
        { id: "side-stir-fried-spinach", name: "Stir-Fried Spinach", prices: one(7), priceSource: "G" },
        { id: "side-plain-chow-mein", name: "Plain Chow Mein & Veggies", prices: one(7), priceSource: "G" },
      ],
    },
    {
      id: "dessert", title: "Dessert", layout: "compact",
      items: [
        { id: "sweet-sticky-rice-mango", name: "Sweet Sticky Rice w/ Mango", prices: one(13), priceSource: "G", aliases: ["mango sticky rice"] },
        { id: "fried-banana", name: "Fried Banana", prices: one(11), priceSource: "G" },
        { id: "coconut-ice-cream", name: "Coconut Ice Cream", prices: one(9.5), priceSource: "G" },
        { id: "green-tea-ice-cream", name: "Green Tea Ice Cream", prices: one(9.5), priceSource: "G" },
        { id: "vanilla-ice-cream", name: "Vanilla Ice Cream", prices: one(9), priceSource: "G" },
        { id: "coconut-ice-cream-fried-bananas", name: "Coconut Ice Cream w/ Fried Bananas", prices: one(13), priceSource: "G" },
        { id: "chocolate-cake-ice-cream", name: "Chocolate Cake & Ice Cream", prices: one(13), priceSource: "G" },
      ],
    },
    {
      id: "kids", title: "Kids", layout: "compact",
      note: "Up to 10 years old. Meal includes a drink; Thai iced tea $2 extra. Choice of white, brown, or fried rice. Chow mein $1.50 extra.",
      items: [
        { id: "kids-teriyaki-chicken-bowl", name: "Kid's Teriyaki Chicken Bowl", prices: one(12), priceSource: "W" },
        { id: "kids-orange-chicken-bowl", name: "Orange Chicken Bowl", prices: one(12), priceSource: "W" },
        { id: "kids-beef-chow-mein", name: "Beef Chow Mein", prices: one(12), priceSource: "W" },
      ],
    },
    {
      id: "soft-drinks", title: "Soft drinks", layout: "compact",
      items: [
        { id: "thai-iced-tea", name: "Thai Iced Tea", prices: one(4.75), priceSource: "W", aliases: ["thai tea"] },
        { id: "coke-products", name: "Coke Products (refill)", prices: one(4.75), priceSource: "W" },
        { id: "house-hot-coffee", name: "House Hot Coffee", prices: one(4.75), priceSource: "W" },
        { id: "thai-iced-coffee", name: "Thai Iced Coffee", prices: one(4.75), priceSource: "W" },
        { id: "house-hot-tea", name: "House Hot Tea", prices: one(4.75), priceSource: "W" },
        { id: "fruit-juice", name: "Fruit Juice", prices: one(5), priceSource: "W" },
      ],
    },
  ],
};
