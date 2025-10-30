# opun_seo_lite/parse.py
from bs4 import BeautifulSoup

def soup(html: str) -> BeautifulSoup:
    return BeautifulSoup(html, 'lxml')

def head_info(html: str) -> dict:
    s = soup(html)
    title = s.title.string.strip() if s.title and s.title.string else None
    md = s.find('meta', attrs={'name':'description'})
    meta_description = md.get('content') if md and md.has_attr('content') else None
    link = s.find('link', attrs={'rel':'canonical'})
    canonical = link.get('href') if link and link.has_attr('href') else None
    robots = s.find('meta', attrs={'name':'robots'})
    meta_robots = robots.get('content').lower() if robots and robots.has_attr('content') else None
    return {'title':title,'meta_description':meta_description,'canonical':canonical,'meta_robots':meta_robots}

def headings(html: str) -> dict:
    s = soup(html)
    out = {}
    for i in range(1,7):
        tag = f'h{i}'
        out[tag] = [h.get_text(strip=True) for h in s.find_all(tag)]
    return out

def social_info(html: str) -> dict:
    s = soup(html)
    def _meta(p, a, v):
        tag = s.find(p, attrs={a: v})
        return tag.get('content') if tag and tag.has_attr('content') else None
    og_title = _meta('meta', 'property', 'og:title') or _meta('meta', 'name', 'og:title')
    og_desc  = _meta('meta', 'property', 'og:description') or _meta('meta', 'name', 'og:description')
    og_image = _meta('meta', 'property', 'og:image') or _meta('meta', 'name', 'og:image')
    tw_card  = _meta('meta', 'name', 'twitter:card')
    return {'og_title': og_title, 'og_description': og_desc, 'og_image': og_image, 'twitter_card': tw_card}

def page_text(html: str) -> str:
    """Texto visible básico: quita script/style/noscript y normaliza espacios."""
    s = soup(html)
    for tag in s(['script','style','noscript']):
        tag.decompose()
    text = s.get_text(separator=' ')
    # compactar espacios
    text = ' '.join(text.split())
    return text
