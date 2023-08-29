from PIL import Image
import os

for root, ds, fs in os.walk("./"):
    for f in fs:
        fullname = os.path.join(root, f)
        if fullname.__contains__("_low.jpg"):
            image = Image.open(fullname)
            resized = image.resize((256, 256))
            # resized.save(fullname.replace(".jpg","_low.jpg"))
            resized.save(fullname)
