import os

photos_dir = "img/photos"
design_dir = "img/design"

photos = [f for f in os.listdir(photos_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))]
designs = [f for f in os.listdir(design_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))]

gaming_ids = [
    "ashPzle2C1s", "yKi7o9uGNgs", "s5jM4a1rFYs", "G5-ioXWAHuM", 
    "o51ED-ZzlzI", "6-utcOulqcI", "TT8BOHs51xw", "BUPhsEaPrms", 
    "h3fLd_qIH1I", "8YeRWS9zYgU", "8PWuBIVqRXs", "z9O3CZI-WqU", 
    "DAnEedSqnUM", "nf_jys0cfwo", "3vRlmsbZumw", "sSCSEIPK0jQ", 
    "eR9Q4JTr2hU"
]

def create_iframe(vid):
    return f'''<div class="video-wrapper">
    <iframe src="https://www.youtube.com/embed/{vid}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
</div>'''

def create_img(folder, img):
    return f'''<div class="img-wrapper">
    <img src="{folder}/{img}" alt="{img}" loading="lazy">
</div>'''

# HTML replacement
with open("index.html", "r") as f:
    content = f.read()

# We need to replace the content inside <main id="main-content"> ... </main>
import re

main_content = f'''
    <section id="accueil" class="page-section active" style="background-image: url('img/Fonds%20Site/Acceuil.png');">
        <div class="glass-panel">
            <h1>Création & Vision Minimalism</h1>
            <p>Bienvenue sur mon portfolio. Découvrez mon univers visuel alliant design épuré, montage dynamique et conception 3D immersive.</p>
        </div>
    </section>

    <section id="a-propos" class="page-section" style="background-image: url('img/Fonds%20Site/A%20propos.png');">
        <div class="glass-panel">
            <h2>À propos de moi</h2>
            <p>Mon parcours et ma vision artistique.</p>
        </div>
    </section>

    <section id="design" class="page-section" style="background-image: url('img/Fonds%20Site/Designs.png');">
        <div class="glass-panel no-bg">
            <h2>Design / Réalisation 3D</h2>
            <div class="media-grid">
                {"".join(create_img(design_dir, img) for img in designs)}
            </div>
        </div>
    </section>

    <section id="photos" class="page-section">
        <div class="glass-panel no-bg">
            <h2>Photos</h2>
            <div class="media-grid">
                {"".join(create_img(photos_dir, img) for img in photos)}
            </div>
        </div>
    </section>

    <section id="cv" class="page-section">
        <div class="glass-panel">
            <h2>Mon CV</h2>
            <p>Retrouvez mon parcours professionnel ici.</p>
        </div>
    </section>

    <section id="contacts" class="page-section" style="background-image: url('img/Fonds%20Site/Contact.png');">
        <div class="glass-panel">
            <h2>Contacts</h2>
            <p>Me contacter pour toute collaboration.</p>
        </div>
    </section>

    <section id="montage-longs" class="page-section" style="background-image: url('img/Fonds%20Site/Montage%20Vidéo.png');">
        <div class="glass-panel no-bg">
            <h2>Formats longs</h2>
            <p>Bientôt disponible...</p>
        </div>
    </section>

    <section id="montage-ugc" class="page-section" style="background-image: url('img/Fonds%20Site/Montage%20Vidéo.png');">
        <div class="glass-panel no-bg">
            <h2>Formats courts UGC</h2>
            <p>Bientôt disponible...</p>
        </div>
    </section>

    <section id="montage-gaming" class="page-section" style="background-image: url('img/Fonds%20Site/Montage%20Vidéo.png');">
        <div class="glass-panel no-bg">
            <h2>Formats courts gaming</h2>
            <div class="media-grid video-grid">
                {"".join(create_iframe(vid) for vid in gaming_ids)}
            </div>
        </div>
    </section>

    <section id="montage-entreprenariat" class="page-section" style="background-image: url('img/Fonds%20Site/Montage%20Vidéo.png');">
        <div class="glass-panel no-bg">
            <h2>Formats courts entreprenariat</h2>
            <p>Bientôt disponible...</p>
        </div>
    </section>
'''

new_content = re.sub(r'<main id="main-content">.*?</main>', f'<main id="main-content">{main_content}</main>', content, flags=re.DOTALL)

with open("index.html", "w") as f:
    f.write(new_content)

print("Updated index.html")
