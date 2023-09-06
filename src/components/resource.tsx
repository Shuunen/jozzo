/**
 * Display a resource card
 * @param props
 * @returns
 */
export function Resource (properties: { description: string; href: string; title: string }) {
  const { description, href, title } = properties
  return (
    <a className="resource" href={href} rel="noreferrer" target="_blank">
      <h2>{title}</h2>
      <p>{description}</p>
    </a>
  )
}
