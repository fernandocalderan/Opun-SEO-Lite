import argparse, json
from pathlib import Path
from .fetch import get
from .parse import head_info, headings
from .checks import run_checks
import pandas as pd

BASE = Path(__file__).resolve().parents[1]
DATA = BASE / 'data' / 'urls.txt'
OUT_JSON = BASE / 'outputs' / 'json'
OUT_CSV = BASE / 'outputs' / 'csv' / 'issues.csv'

def crawl(seed: Path, max_pages: int | None = None):
    urls = [u.strip() for u in seed.read_text(encoding='utf-8').splitlines() if u.strip() and not u.startswith('#')]
    if max_pages: urls = urls[:max_pages]
    OUT_JSON.mkdir(parents=True, exist_ok=True)
    for url in urls:
        r = get(url)
        info = head_info(r.text)
        h = headings(r.text)
        result = {
            'url': str(r.url),
            'status': r.status_code,
            **info,
            'headings': h,
        }
        result['issues'] = run_checks(result)
        name = url.replace('://','_').replace('/','_')
        (OUT_JSON / f'{name}.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'Crawl OK: {len(urls)} pÃ¡ginas â†’ {OUT_JSON}')

def export_csv():
    rows = []
    for fp in OUT_JSON.glob('*.json'):
        data = json.loads(fp.read_text(encoding='utf-8'))
        for issue in data.get('issues', []):
            rows.append({
                'url': data['url'],
                'status': data['status'],
                'category': issue['category'],
                'severity': issue['severity'],
                'message': issue['message'],
                'title': data.get('title'),
                'meta_description': data.get('meta_description'),
            })
    if not rows:
        print('No hay issues. Ejecuta crawl primero.')
        return
    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    pd.DataFrame(rows).to_csv(OUT_CSV, index=False, encoding='utf-8')
    print(f'CSV listo: {OUT_CSV}')

def main():
    ap = argparse.ArgumentParser(prog='opun-seo', description='Opun SEO Lite')
    sub = ap.add_subparsers(dest='cmd', required=True)
    p1 = sub.add_parser('crawl', help='Crawlea URLs desde data/urls.txt')
    p1.add_argument('--max-pages', type=int, default=None)
    sub.add_parser('export', help='Exporta issues a CSV')
    sub.add_parser('report', help='Alias de export (HTML opcional en el futuro)')
    args = ap.parse_args()

    if args.cmd == 'crawl':
        crawl(DATA, max_pages=args.max_pages)
    elif args.cmd in ('export','report'):
        export_csv()