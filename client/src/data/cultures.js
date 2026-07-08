// Catalogue des cultures pratiquées en Guinée, partagé par le registre digital
// et le module drones (une seule source, pour éviter les listes qui divergent).
export const CULTURES = [
  "Riz", "Manioc", "Maïs", "Fonio", "Arachide", "Igname", "Patate douce",
  "Mil / Sorgho", "Café", "Cacao", "Ananas", "Orange", "Goyave", "Banane / Plantain", "Mangue",
  "Agrumes", "Palmier à huile", "Coton", "Anacarde (cajou)", "Sésame",
  "Pomme de terre", "Tomate", "Oignon", "Aubergine", "Gombo", "Chou",
  "Carotte", "Poivron", "Piment", "Courgette", "Haricot", "Pois", "Betterave",
  "Chou-fleur", "Brocoli", "Laitue", "Persil",
];

// Valeur sentinelle affichée en fin de liste : sélectionnée, elle révèle un
// champ libre pour saisir une culture absente du catalogue.
export const AUTRE_CULTURE = "Autre";
export const CULTURES_WITH_AUTRE = [...CULTURES, AUTRE_CULTURE];

export const VARIETES_PAR_CULTURE = {
  "Riz": ["NERICA", "Kabako", "Riz de bas-fond local", "Riz pluvial local", "Sahel 108"],
  "Manioc": ["Manioc local doux", "Manioc amer", "IRAG variété améliorée", "TMS"],
  "Maïs": ["Maïs jaune local", "Maïs blanc", "Variété hybride améliorée", "DMR"],
  "Fonio": ["Fonio blanc (Pôdji)", "Fonio noir", "Fonio précoce", "Fonio tardif"],
  "Arachide": ["Arachide locale", "Variété hâtive", "Variété à gros calibre"],
  "Igname": ["Igname blanche", "Igname jaune", "Variété locale précoce"],
  "Patate douce": ["Patate à chair orange", "Patate à chair blanche", "Variété locale"],
  "Mil / Sorgho": ["Mil local", "Sorgho rouge", "Sorgho blanc"],
  "Café": ["Robusta", "Arabica", "Café local"],
  "Cacao": ["Cacao Forastero", "Cacao Trinitario", "Cacao local amélioré"],
  "Ananas": ["Baronne de Guinée", "Cayenne lisse", "Pain de sucre"],
  "Orange": ["Orange locale", "Citron", "Pamplemousse", "Orange Navel"],
  "Goyave": ["Goyave locale", "Variété améliorée"],
  "Banane / Plantain": ["Plantain corne", "Plantain french", "Banane douce locale"],
  "Mangue": ["Mangue Kent", "Mangue Amélie", "Mangue locale"],
  "Agrumes": ["Orange locale", "Mandarine", "Citron", "Pamplemousse"],
  "Palmier à huile": ["Palmier Tenera", "Palmier Dura", "Variété locale"],
  "Coton": ["Coton local", "Variété améliorée"],
  "Anacarde (cajou)": ["Cajou local", "Variété greffée"],
  "Sésame": ["Sésame blanc", "Sésame local"],
  "Pomme de terre": ["Variété locale du Fouta", "Variété importée"],
  "Tomate": ["Tomate locale", "Variété Roma", "Variété hybride"],
  "Oignon": ["Oignon violet de Galmi", "Oignon local"],
  "Aubergine": ["Aubergine locale (Jaxatu)", "Aubergine violette"],
  "Gombo": ["Gombo local", "Variété améliorée"],
  "Chou": ["Chou vert", "Chou pommé", "Chou frisé"],
  "Carotte": ["Carotte locale", "Carotte orange", "Carotte violette"],
  "Poivron": ["Poivron vert", "Poivron rouge", "Poivron jaune"],
  "Piment": ["Piment local", "Piment fort", "Piment doux"],
  "Courgette": ["Courgette verte", "Courgette jaune"],
  "Haricot": ["Haricot local", "Haricot nain", "Haricot grimpant"],
  "Pois": ["Pois local", "Pois chiche", "Pois d'Angole"],
  "Betterave": ["Betterave rouge", "Betterave blanche"],
  "Chou-fleur": ["Chou-fleur blanc", "Chou-fleur violet"],
  "Brocoli": ["Brocoli vert", "Brocoli violet"],
  "Laitue": ["Laitue romaine", "Laitue pommée"],
  "Persil": ["Persil plat", "Persil frisé"],
};
