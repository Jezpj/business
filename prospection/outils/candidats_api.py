#!/usr/bin/env python3
"""Liste des agences immobilières candidates via l'API officielle « Recherche d'entreprises »
(DINUM, données INSEE/RNE, Licence Ouverte 2.0) — https://recherche-entreprises.api.gouv.fr

Critères : code NAF 68.31Z, entreprise active, employeuse (3 à 49 salariés par défaut), filtrée par code postal.
Les entreprises qui se sont opposées à l'utilisation commerciale de leurs données sont EXCLUES d'office.

Usage : python3 prospection/outils/candidats_api.py --ville 74120 --ville 64200 [--tranches 02,03,11,12] > candidats.csv
Étapes suivantes (manuelles) : écarter les réseaux, lire le site, trouver une adresse générique publiée, personnaliser.
"""
import argparse
import csv
import json
import sys
import time
import urllib.parse
import urllib.request

API = 'https://recherche-entreprises.api.gouv.fr/search'
EFFECTIFS = {'01': '1-2', '02': '3-5', '03': '6-9', '11': '10-19', '12': '20-49'}


def chercher(code_postal, tranches):
    params = {'activite_principale': '68.31Z', 'etat_administratif': 'A', 'code_postal': code_postal,
              'tranche_effectif_salarie': tranches, 'per_page': 25}
    url = API + '?' + urllib.parse.urlencode(params)
    for essai in range(3):
        try:
            with urllib.request.urlopen(url, timeout=30) as r:
                return json.load(r).get('results', [])
        except Exception:
            time.sleep(2 + essai * 2)
    return []


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--ville', action='append', required=True, help='code postal (répétable)')
    ap.add_argument('--tranches', default='02,03,11,12', help='tranches d’effectif INSEE (défaut : 3 à 49 salariés)')
    a = ap.parse_args()
    w = csv.writer(sys.stdout, delimiter=';')
    w.writerow(['code_postal', 'siren', 'nom', 'effectif', 'etablissements_ouverts', 'creation', 'adresse_siege', 'dirigeant', 'source'])
    vus = set()
    for cp in a.ville:
        for e in chercher(cp, a.tranches):
            if e.get('opposition_diffusion_commerciale') is not False or e['siren'] in vus:
                continue  # opposition à la prospection (ou information absente) : exclusion
            vus.add(e['siren'])
            d = (e.get('dirigeants') or [{}])[0]
            w.writerow([cp, e['siren'], e.get('nom_complet'), EFFECTIFS.get(e.get('tranche_effectif_salarie'), e.get('tranche_effectif_salarie')),
                        e.get('nombre_etablissements_ouverts'), e.get('date_creation'), (e.get('siege') or {}).get('adresse'),
                        ' '.join(filter(None, [d.get('prenoms'), d.get('nom'), f"({d.get('qualite')})" if d.get('qualite') else None])),
                        f"https://annuaire-entreprises.data.gouv.fr/entreprise/{e['siren']}"])
        time.sleep(0.4)


if __name__ == '__main__':
    main()
