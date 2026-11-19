// Export des documents : impression (PDF via la boîte de dialogue du navigateur) et Word (.doc modifiable).

export function imprimer(htmlComplet) {
  const ancien = document.getElementById('cadre-impression');
  if (ancien) ancien.remove();
  const cadre = document.createElement('iframe');
  cadre.id = 'cadre-impression';
  cadre.title = 'Impression';
  cadre.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
  document.body.appendChild(cadre);
  const doc = cadre.contentDocument;
  doc.open();
  doc.write(htmlComplet);
  doc.close();
  const lancer = () => { cadre.contentWindow.focus(); cadre.contentWindow.print(); };
  if (doc.readyState === 'complete') setTimeout(lancer, 50); else cadre.onload = () => setTimeout(lancer, 50);
}

function telecharger(contenu, nomFichier, type) {
  const blob = new Blob([contenu], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomFichier;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Word ouvre nativement le HTML enrichi des espaces de noms Office : le document reste modifiable. */
export function telechargerWord(htmlComplet, nomFichier) {
  const word = htmlComplet
    .replace('<html lang="fr">', '<html lang="fr" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">')
    .replace('<head>', '<head><!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->');
  telecharger('﻿' + word, nomFichier.replace(/\.(html|doc)$/i, '') + '.doc', 'application/msword');
}

export function telechargerTexte(texte, nomFichier, type = 'application/json') {
  telecharger(texte, nomFichier, type);
}

export function nomDeFichier(base) {
  return base.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase();
}
