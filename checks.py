def run_checks(result: dict) -> list[dict]:
    issues: list[dict] = []
    if result['status'] >= 400:
        issues.append({'category':'indexability','severity':'error','message':f'HTTP {result["status"]}'})
    if not result.get('title'):
        issues.append({'category':'content','severity':'warn','message':'Falta <title>'})
    if not result.get('meta_description'):
        issues.append({'category':'content','severity':'info','message':'No meta description'})
    h1 = result.get('headings',{}).get('h1',[])
    if len(h1) == 0:
        issues.append({'category':'content','severity':'info','message':'No hay H1'})
    if len(h1) > 1:
        issues.append({'category':'content','severity':'warn','message':f'H1 mÃºltiples ({len(h1)})'})
    if result.get('meta_robots') and 'noindex' in result['meta_robots']:
        issues.append({'category':'indexability','severity':'warn','message':'meta robots contiene noindex'})
    return issues