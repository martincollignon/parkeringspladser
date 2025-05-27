# Social Media Assets

This folder contains social media preview images and related assets for the Find Parkeringsplads application.

## Required Images

### Open Graph Image (`og-image.png`)
- **Size**: 1200x630px (recommended)
- **Format**: PNG or JPG
- **Purpose**: Used for Facebook, LinkedIn, and other Open Graph platforms
- **Content**: Should include your logo, app name, and key value proposition

### Twitter Card Image (`twitter-card.png`)
- **Size**: 1200x675px (recommended for summary_large_image)
- **Format**: PNG or JPG
- **Purpose**: Used for Twitter card previews
- **Content**: Similar to OG image but optimized for Twitter's display

### Additional Recommended Images
- `og-image-square.png` (1200x1200px) - For platforms that prefer square images
- `favicon-social.png` (512x512px) - High-res favicon for social platforms

## Image Guidelines

1. **Text Readability**: Ensure text is large enough to read when scaled down
2. **Brand Consistency**: Use your brand colors and fonts
3. **Safe Area**: Keep important content within the center 80% of the image
4. **File Size**: Keep under 1MB for faster loading
5. **Alt Text**: Always provide descriptive alt text

## Usage in Code

### Default Social Meta (Applied to all pages)
The default social media metadata is automatically applied via the layout component.

### Page-Specific Social Meta
To override social media metadata for specific pages:

```svelte
<script>
  import SocialMeta from '$lib/components/SocialMeta.svelte';
</script>

<SocialMeta meta={{
  title: 'Brugerdefineret sidetitel',
  description: 'Brugerdefineret sidebeskrivelse til sociale medier',
  image: '/social/custom-page-image.png',
  url: '/custom-page'
}} />
```

### Dynamic Social Meta
For dynamic content (like parking spot details):

```svelte
<script>
  import SocialMeta from '$lib/components/SocialMeta.svelte';
  
  export let data; // From page load function
  
  $: socialMeta = {
    title: `Parkering på ${data.spot.address} - Find Parkeringsplads`,
    description: `${data.spot.description} - Find parkeringsløsninger i København`,
    image: data.spot.image || '/social/og-image.png',
    url: `/parking/${data.spot.id}`
  };
</script>

<SocialMeta meta={socialMeta} />
```

## Testing Social Media Previews

1. **Facebook**: [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
2. **Twitter**: [Twitter Card Validator](https://cards-dev.twitter.com/validator)
3. **LinkedIn**: [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
4. **General**: [OpenGraph.xyz](https://www.opengraph.xyz/)

## Configuration

Update the default values in `src/lib/social.js`:
- Domain URL is set to `https://findparkeringsplads.dk`
- No social media handles configured (twitterSite is undefined)
- All text is in Danish to reflect the Copenhagen parking service 