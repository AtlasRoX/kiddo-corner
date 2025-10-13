interface DescriptionOptions {
  productName: string
  tone: string
  length: string
  audience: string
  features: string[]
  benefits: string[]
}

export function generateProductDescription(options: DescriptionOptions): string {
  const { productName, tone, length, audience, features, benefits } = options

  // Tone-specific phrases
  const toneIntros: Record<string, string[]> = {
    professional: [
      `Introducing the ${productName}, a premium solution designed for optimal performance.`,
      `The ${productName} offers exceptional quality and reliability for discerning customers.`,
      `Experience superior craftsmanship with the ${productName}, meticulously designed for excellence.`,
    ],
    friendly: [
      `Meet the ${productName}, your new favorite baby essential!`,
      `We're excited to introduce you to the ${productName} - you're going to love it!`,
      `Say hello to the ${productName}, the perfect addition to your baby's collection!`,
    ],
    enthusiastic: [
      `The AMAZING ${productName} is here to revolutionize your baby care routine!`,
      `Get ready to be BLOWN AWAY by the incredible ${productName}!`,
      `We're THRILLED to present the game-changing ${productName} that parents everywhere are raving about!`,
    ],
    formal: [
      `We present the ${productName}, manufactured to the highest standards of quality.`,
      `${productName} represents our commitment to excellence in baby product manufacturing.`,
      `It is our pleasure to introduce the ${productName}, a product of significant research and development.`,
    ],
    casual: [
      `Check out our cool new ${productName} - it's a total game-changer!`,
      `The ${productName} is super easy to use and your baby will love it!`,
      `Our ${productName} is pretty awesome - just saying!`,
    ],
  }

  // Audience-specific phrases
  const audiencePhrases: Record<string, string[]> = {
    general: [
      `Perfect for everyday use.`,
      `Designed with all families in mind.`,
      `A must-have for any household with children.`,
    ],
    parents: [
      `Designed by parents, for parents.`,
      `Making parenting just a little bit easier.`,
      `Because we understand what parents need.`,
    ],
    children: [
      `Kids absolutely love it!`,
      `Designed to delight children while providing what they need.`,
      `Fun and functional - a winning combination for children.`,
    ],
    premium: [
      `Crafted for those who appreciate the finer things.`,
      `Luxury meets functionality in this premium product.`,
      `An investment in quality that discerning customers will appreciate.`,
    ],
    budget: [
      `Quality doesn't have to break the bank.`,
      `Affordable without compromising on what matters.`,
      `Great value for budget-conscious families.`,
    ],
  }

  // Select random intro based on tone
  const intros = toneIntros[tone] || toneIntros.professional
  const intro = intros[Math.floor(Math.random() * intros.length)]

  // Select random audience phrase
  const audienceOptions = audiencePhrases[audience] || audiencePhrases.general
  const audiencePhrase = audienceOptions[Math.floor(Math.random() * audienceOptions.length)]

  // Format features and benefits
  let featuresText = ""
  if (features.length > 0) {
    featuresText = `\n\nKey Features:\n` + features.map((f) => `• ${f}`).join("\n")
  }

  let benefitsText = ""
  if (benefits.length > 0) {
    benefitsText = `\n\nBenefits:\n` + benefits.map((b) => `• ${b}`).join("\n")
  }

  // Generate main description based on length
  let mainDescription = ""

  switch (length) {
    case "short":
      mainDescription = `${intro} ${audiencePhrase}`
      break
    case "medium":
      mainDescription = `${intro} ${audiencePhrase} Our ${productName} combines quality, functionality, and style to provide an exceptional experience for you and your baby.`
      break
    case "long":
      mainDescription = `${intro} ${audiencePhrase} Our ${productName} combines quality, functionality, and style to provide an exceptional experience for you and your baby. We've paid attention to every detail to ensure this product exceeds your expectations and makes your life easier. With durability and comfort in mind, we've created something that will stand the test of time.`
      break
    default:
      mainDescription = `${intro} ${audiencePhrase} Our ${productName} combines quality, functionality, and style.`
  }

  // Combine all parts
  return `${mainDescription}${featuresText}${benefitsText}`
}
