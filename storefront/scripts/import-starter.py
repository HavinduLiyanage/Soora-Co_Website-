"""Read the supplied workbook; export only customer-facing catalog fields."""
import json, re, sys
from pathlib import Path
import openpyxl

sheet = openpyxl.load_workbook(sys.argv[1], data_only=True)["Watch Inventory"]
products = []
for row in list(sheet.values)[4:]:
    number, brand, name, _, _, _, stock, _, price, _, _ = row
    if not isinstance(number, int):
        continue
    ref = next(word for word in name.split() if re.fullmatch(r"[A-Z][A-Z0-9-]*", word) and any(c.isdigit() for c in word))
    products.append(dict(id=ref, slug=(brand.lower()+"-"+ref.lower()), brand=brand.title(), name=name,
        gender="Men" if "Men's" in name else "Unspecified",
        style="Chronograph" if "Chronograph" in name else "Not specified",
        movement="Quartz" if "Quartz" in name else "Not specified",
        strap="Stainless steel" if "Stainless Steel" in name else "Leather" if "Leather" in name else "Resin" if "Resin" in name else "Not specified",
        description=f"{brand.title()} {name}. Contact Soora & Co. to confirm availability and full specifications.",
        featured=number in [1,6,33,36], variants=[dict(id=ref.lower(), colour="Not specified", swatch="#bca36b", image="", priceMinor=round(price*100), stock=stock, availabilityUnconfirmed=True)]))
assert len(products)==38 and len({p['id'] for p in products})==38
target=Path(__file__).resolve().parents[1]/'lib'/'inventory.json'
target.write_text(json.dumps(products,indent=2)+'\n',encoding='utf-8')
print(f'Exported {len(products)} watches. No costs, competitor prices, or invented sale offers included.')
