"""Build a reviewed catalogue manifest and cropped drinkware from the five PDFs."""
from pathlib import Path
from collections import Counter
import hashlib
import json
import io
import pymupdf as fitz
from PIL import Image, ImageChops

ROOT = Path("generated-artifacts/catalogues")
records = json.loads((ROOT/"cuts.json").read_text())
files = {r["filename"]: r for r in records}
products = []
seen = {}
source_names = {
    "min": "MIN catalogue Garage.pdf", "drinkware": "DRINK WARE.pdf",
    "bags": "Bag collection(1).PDF", "eco": "Eco-friendly collection.pdf",
    "portfolio": "KCB ITEMSs.pdf",
}

def add(filename, name, category, subcategory, eco=False):
    if filename not in files:
        raise ValueError(f"Missing reviewed image: {filename}")
    r = files[filename]
    image = Image.open(r["file"]).convert("RGB")
    # Identical full cuts repeated in the bag and eco catalogues are one item.
    digest = hashlib.sha256(image.resize((64,64)).tobytes()).hexdigest()
    if digest in seen and filename != "eco-p13-04.webp":
        seen[digest]["eco"] |= eco
        seen[digest].setdefault("additionalSources", []).append({"pdf": source_names[r["pdf"]], "page": r["page"]})
        return
    p = {
        "id": filename.removesuffix(".webp"), "name": name,
        "category": category, "subcategory": subcategory,
        "image": f"/api/catalogue-assets/{filename}",
        "width": r["width"], "height": r["height"],
        "sourcePdf": source_names[r["pdf"]], "page": r["page"],
        "eco": eco, "teaser": False,
    }
    products.append(p)
    seen[digest] = p

def batch(pdf, page, indices, name, category, sub, eco=False):
    for i in indices:
        filename = f"{pdf}-p{page:02}-{i:02}.webp"
        if filename in files:
            add(filename, f"{name} · option {i}", category, sub, eco)

# The MIN company profile provides printed products, garments and PPE.
min_specs = {
    3: [
        (1,"Printed promotional wristbands","promotional-products","wristbands"),
        (2,"Branded baseball caps","textiles","caps"),
        (3,"Metal drink bottles","drinkware","bottles"),
        (4,"Insulated tumbler collection","drinkware","tumblers"),
        (5,"Handled drink bottles","drinkware","bottles"),
        (6,"Reusable bottle collection","drinkware","bottles"),
        (7,"Metal promotional pens","corporate-gifts","pens"),
        (8,"Branded wall clock","promotional-products","clocks"),
        (9,"Backpack collection","bags","backpacks"),
        (11,"Printed stationery","commercial-printing","stationery"),
        (12,"Laptop carry bag","bags","laptop"),
        (13,"Travel tumblers","drinkware","tumblers"),
        (14,"Executive notebooks","corporate-gifts","notebooks"),
        (15,"Business card holders","corporate-gifts","office-supplies"),
        (16,"Non-woven shopping bags","bags","shopping"),
        (17,"Paper gift bags","bags","paper"),
    ],
    4: [(i, name, "corporate-gifts", "gift-sets") for i,name in enumerate([
        "Notebook and drinkware gift set","Notebook and pen gift set","Colorful executive gift sets",
        "Executive notebook gift box","Mug and stationery gift box","Red notebook gift set",
        "Mug and diary gift set","Presentation gift boxes","Black executive gift set",
        "Premium business gift set","USB presentation boxes"],1)],
    5: [
        (1,"Foam ear plugs","ppe","ear"),(2,"Protective earmuffs","ppe","ear"),
        (3,"Blue safety helmet","ppe","head"),(4,"Red safety helmet","ppe","head"),
        (6,"White safety helmet","ppe","head"),(7,"Yellow safety helmet","ppe","head"),
        (8,"Work gloves","ppe","hand"),(9,"Reflective protective workwear","ppe","body"),
        (10,"Lace-up safety boots","ppe","foot"),(11,"Safety gumboots","ppe","foot"),
        (12,"Reflective safety vest","ppe","body"),(13,"Protective face shield","ppe","eye"),
        (14,"Protective safety glasses","ppe","eye"),(15,"Dust mask","ppe","respiratory"),
    ],
    6: [
        (1,"Red scrub uniform","textiles","nurse-scrubs"),
        (2,"Round-neck T-shirt collection","textiles","round-neck"),
        (3,"Two-piece work overall","textiles","workwear"),
        (4,"Workshop overcoat","textiles","workwear"),
        (5,"Reflective overall","textiles","reflective"),
        (6,"Chef coat","textiles","chef-wear"),(7,"Security uniform","textiles","security"),
        (8,"Utility half jacket","textiles","workwear"),(9,"School uniform","textiles","school-uniform"),
        (10,"Schoolwear set","textiles","school-uniform"),(11,"Navy polo shirts","textiles","polo"),
        (12,"Ladies office shirt","textiles","shirts-ladies"),(13,"Ladies suit jacket","textiles","shirts-ladies"),
        (14,"Blue polo shirt","textiles","polo"),(15,"Green polo shirt","textiles","polo"),
        (16,"Round-neck T-shirts","textiles","round-neck"),(17,"Office dress","textiles","ladies-office-wear"),
    ],
    7: [
        (1,"Commercial print examples","commercial-printing","print-samples"),
        (3,"Branded diary","corporate-gifts","diaries"),
        (5,"Printed presentation booklet","commercial-printing","booklets"),
        (7,"Printed desk calendars","commercial-printing","calendars"),
        (14,"Large-format branding examples","large-format","display-printing"),
        (15,"Pull-up display banner","large-format","banners"),
        (16,"Feather display banner","large-format","banners"),
        (18,"Portable display stand","large-format","display-stands"),
        (19,"Branded gazebo","large-format","gazebos"),
        (23,"Outdoor advertising billboard","large-format","signage"),
    ],
}
for page, entries in min_specs.items():
    for i,name,cat,sub in entries:
        filename = f"min-p{page:02}-{i:02}.webp"
        if filename in files:
            add(filename,name,cat,sub)

# Reviewed complete bag cuts: omit human scenes, close-up details and logos.
bag_selection = {
    2:[3,5,10,11], 3:[3,4,5,6,13,14,15], 4:[3,4,6,7,9],
    5:[2,4,5,6,7,8,9,10,11,12,13,15,16,17],
    6:[1,6,7,8,13,14,19], 7:[2,3,4,5,6,7,8,9,11,12],
    8:[3,4], 9:[3,4,6,7,8,9,10,11,12,13,14,15],
    10:[1,2,3,4,5,6,7,8,9,13,15],
    11:[2,3,4,5,6,7,8,9,10,14,15,16,18,19,20,21,22,23,24],
    12:[1,2,3,4,8,9,10,11,13,14,15,16,17,18],
    13:[1,2,3,5,6,7,9,10], 14:[2,3,4,5,6,7,8,9,11,12,13],
    15:[1,3,4,6,7], 16:[1,2,3,4,6,7,8,9,10,11,12,13],
    17:[1,2], 18:[1,2,3,4,5,9,13,14],
    19:[1,3,4,6,7,9,10,11,12,15],
}
bag_types = {
    2:("Laptop backpack","backpacks"),3:("Laptop backpack","backpacks"),
    4:("Business backpack","backpacks"),5:("Travel backpack","backpacks"),6:("Backpack","backpacks"),
    7:("Laptop bag or sleeve","laptop"),8:("Travel duffle bag","duffles"),
    9:("Insulated cooler bag","cooler"),10:("Drawstring bag","drawstring"),
    11:("Non-woven shopping bag","shopping"),12:("Cotton tote bag","tote"),
    13:("Natural-fabric drawstring bag","drawstring"),14:("Canvas bag","canvas"),
    15:("Jute shopping bag","jute"),16:("Jute carry bag","jute"),
    17:("Jute tote bag","jute"),18:("Paper gift bag","paper"),19:("Kraft paper bag","paper"),
}
for page, indices in bag_selection.items():
    name, sub = bag_types[page]
    batch("bags",page,indices,name,"bags",sub,eco=page>=12)

eco_selection = {
    2:[3,4,5,6,7,8,9,11],3:[1,2,3,4],4:[2,4,5],
    5:[3,4,5,6,7,8,10,11,12],6:[1,2,3,4,5,6,9],
    7:[3,4,5,6,7,8,9,10,11,12,13],8:[3,4,5,6,7,8],
    9:[2,3,5,7,9,10,11,13,14,15,16,17,18],
    10:[1,2,3,4,8,9,10,11,13,14,15,16,17,18],
    11:[1,2,3,5,6,7,9,10],12:[2,3,4,5,6,7,8,9,11,12,13],
    13:[1,3,4,6,7,8],14:[1,2,3,4,6,7,8,9,10,11,12,13],15:[1,2],
    16:[1,2,3,4,5,9,13,14],17:[1,3,4,6,7,9,10,11,12,15],
}
eco_types = {
    2:("Bamboo wireless charging pad","bamboo"),3:("Bamboo charging stand","bamboo"),
    4:("Bamboo mobile stand","bamboo"),5:("Eco notebook","notebooks"),
    6:("Eco office accessory","office-supplies"),7:("Recycled stationery organizer","office-supplies"),
    8:("Wooden stationery set","stationery"),9:("Eco stationery","stationery"),
    10:("Cotton tote bag","tote"),11:("Natural drawstring bag","drawstring"),
    12:("Canvas tote bag","canvas"),13:("Jute bag","jute"),14:("Jute carry bag","jute"),
    15:("Jute tote bag","jute"),16:("Paper gift bag","paper"),17:("Kraft paper bag","paper"),
}
for page, indices in eco_selection.items():
    name, sub = eco_types[page]
    batch("eco",page,indices,name,"eco",sub,eco=True)

# KCB document is a sample-item list, not proof of a client relationship.
portfolio_names = {
    (1,1):"SME hamper notebook and pen",(1,2):"Ceramic travel tumbler sample",
    (2,1):"MO hamper notebook gift set",(2,2):"Eco toiletry bag sample",
    (3,1):"Vacuum insulated bottle sample",(3,2):"Additional travel gift sample",
    (4,1):"Vacuum bottle with cork lid sample",
}
for (page,i), name in portfolio_names.items():
    add(f"portfolio-p{page:02}-{i:02}.webp",name,"portfolio","kcb-catalogue")

# DRINK WARE is flattened page photography: reviewed rectangles exclude titles,
# descriptive copy and partial details. Coordinates are fractions of each page.
drink_crops = {
    3:[("Stainless steel tumblers","tumblers",(.185,.195,.54,.36)),("Stainless tumblers with straw lids","tumblers",(.06,.56,.48,.76))],
    4:[("Bamboo infuser bottle","bottles",(.025,.205,.335,.815))],
    5:[("Cork-bottom ceramic mug","mugs",(.025,.267,.205,.412)),("Cork-bottom tumbler","tumblers",(.545,.167,.742,.447))],
    6:[("Bamboo bottle collection","bottles",(.025,.19,.33,.405))],
    7:[("Glass infuser bottles","sippers",(.52,.22,.98,.47))],
    8:[("Double-wall glass tumbler","tumblers",(.02,.19,.26,.515))],
    9:[("Black thermal bottle","flasks",(.025,.19,.235,.52))],
    10:[("Thermal cork bottles","flasks",(.025,.19,.273,.42))],
    11:[("Double-wall tumbler","tumblers",(.02,.20,.48,.51)),("Colored tumbler collection","tumblers",(.04,.62,.965,.805))],
    12:[("Stainless steel travel tumblers","tumblers",(.025,.23,.54,.47))],
    13:[("Thermal bottle collection","flasks",(.025,.61,.50,.785))],
    14:[("Vacuum thermal bottles","vacuum",(.04,.23,.295,.515))],
    15:[("Aluminium bottle collection","bottles",(.59,.235,.98,.405))],
    16:[("Travel mugs","mugs",(.025,.19,.52,.42))],
    17:[("Thermometer bottle collection","vacuum",(.065,.662,.535,.945))],
    19:[("Never-fall travel mug collection","mugs",(.38,.21,.96,.41))],
    22:[("Sports bottle collection","bottles",(.025,.19,.465,.324))],
    23:[("Fruit infuser bottle collection","sippers",(.025,.20,.48,.505))],
    24:[("Ceramic mug collection","mugs",(.54,.175,.945,.43))],
    25:[("Colorful ceramic mugs","mugs",(.50,.59,.95,.785))],
    26:[("Classic ceramic mugs","mugs",(.025,.19,.48,.50)),("Colored ceramic mugs","mugs",(.525,.635,.98,.79))],
    28:[("PU tea coaster gift set","coasters",(.54,.18,.97,.43))],
}
drink_doc = fitz.open("attached_assets/0_DRINK_WARE_1791580363283.pdf")
drink_folder = ROOT/"drinkware"/"cuts"
drink_folder.mkdir(exist_ok=True)
for page, crops in drink_crops.items():
    for i,(name,sub,box) in enumerate(crops,1):
        source_page = drink_doc[page-1]
        pix = source_page.get_pixmap(matrix=fitz.Matrix(2,2), alpha=False)
        image = Image.frombytes("RGB",(pix.width,pix.height),pix.samples)
        x0,y0,x1,y1 = box
        image = image.crop((int(x0*pix.width),int(y0*pix.height),int(x1*pix.width),int(y1*pix.height)))
        difference = ImageChops.difference(image, Image.new("RGB",image.size,"white"))
        bbox = difference.point(lambda x: 255 if x>22 else 0).getbbox()
        if bbox: image = image.crop(bbox)
        image.thumbnail((900,1100))
        padded = Image.new("RGB",(image.width+32,image.height+32),"white")
        padded.paste(image,(16,16))
        filename = f"drinkware-p{page:02}-{i:02}.webp"
        padded.save(drink_folder/filename,quality=90,method=6)
        files[filename] = {"file":str(drink_folder/filename),"filename":filename,"pdf":"drinkware","page":page,"width":padded.width,"height":padded.height}
        add(filename,name,"drinkware",sub)

teasers = {
    "drinkware-p12-01","drinkware-p14-01","bags-p02-03","bags-p08-03",
    "eco-p13-04","eco-p03-01","min-p04-01","min-p03-14",
    "min-p03-01","min-p03-08","portfolio-p01-01","portfolio-p02-02",
}
for p in products:
    p["teaser"] = p["id"] in teasers
assert sum(p["teaser"] for p in products) == 12, f"Missing teaser cuts: {teasers - {p['id'] for p in products}}"
assert all(sum(p["teaser"] and p["category"]==cat for p in products)==2 for cat in ("drinkware","bags","eco","corporate-gifts","promotional-products","portfolio"))

service_specs = [
    ("large-format","Large Format","min-p07-23.webp"),
    ("commercial-printing","Commercial Printing","min-p07-01.webp"),
    ("corporate-branding","Corporate Branding","min-p04-01.webp"),
    ("promotional-gifts","Promotional Gifts","min-p03-07.webp"),
    ("textile-garment","Textile/Garment","min-p06-14.webp"),
    ("eco-printing","Eco Printing","eco-p05-03.webp"),
]
services = [{"id":slug,"name":name,"image":f"/api/catalogue-assets/{file}","href":f"/products/{slug}"} for slug,name,file in service_specs]
data = {
    "about":"Print Garage is a branding and printing company offering quality commercial printing, PPE supplies, office supplies and promotional items. We offer packages for businesses and organizations to promote brand visibility.",
    "vision":"To be a one stop center providing exceptional services.",
    "mission":"To provide unique, timely and professional branding services for better customer experience.",
    "purpose":"To establish sustainable relationships with our clients, as the leading service provider in the printing, advertising and marketing industry.",
    "products":products, "services":services,
    "sourceNotes":{
        "about":"Adapted from MIN catalogue Garage.pdf, page 2",
        "vision":"MIN catalogue Garage.pdf, page 2",
        "mission":"MIN catalogue Garage.pdf, page 2",
        "purpose":"User-provided fallback; no purpose wording was found in the PDFs.",
        "partners":"Partner logos are sourced separately from page 4 of the supplied Brimas corporate profile.",
        "missingItems":"No standalone umbrellas, speakers, power banks, AMP 020 identifier, JUCO identifier or seed-pencil claim could be verified; the MIN catalogue has eight pages, not 49.",
    },
}
destination = Path("artifacts/brimas-media/src/lib/print-garage-catalogue.json")
destination.write_text(json.dumps(data,indent=2))
used = {p["image"].split("/")[-1] for p in products} | {f for _,_,f in service_specs}
(ROOT/"upload.json").write_text(json.dumps([files[f] for f in sorted(used)],indent=2))
print("Products:",len(products),"Teasers:",sum(p["teaser"] for p in products),"Categories:",dict(Counter(p["category"] for p in products)))
print("Unique upload images:",len(used))
