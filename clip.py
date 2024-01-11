import torch
from PIL import Image
import open_clip

# @see https://github.com/mlfoundations/open_clip?tab=readme-ov-file#usage

model, _, preprocess = open_clip.create_model_and_transforms(
    'ViT-B-32', pretrained='laion2b_s34b_b79k')
tokenizer = open_clip.get_tokenizer('ViT-B-32')

filePath = 'output/4nTBpM8iA-4265861860.jpeg'

image = preprocess(Image.open(filePath)).unsqueeze(0)
text = tokenizer(["a sad image", "a happy image"])

with torch.no_grad(), torch.cuda.amp.autocast():
    image_features = model.encode_image(image)
    text_features = model.encode_text(text)
    image_features /= image_features.norm(dim=-1, keepdim=True)
    text_features /= text_features.norm(dim=-1, keepdim=True)

    text_probs = (100 * image_features @ text_features.T).softmax(dim=-1)

print("Label probs:", text_probs)  # prints: [[1., 0., 0.]]
