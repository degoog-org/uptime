declare module "subset-font" {
  interface SubsetFontOptions {
    targetFormat?: "woff2" | "woff" | "truetype" | "sfnt";
  }

  const subsetFont: (
    font: Buffer,
    text: string,
    options?: SubsetFontOptions,
  ) => Promise<Buffer>;
  export default subsetFont;
}
