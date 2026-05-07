import { describe, it, expect } from "vitest";
import { parseDescriptionTags } from "../src/config/description-parser.js";

const DUMMY_FOLDER = "/tmp";
const DUMMY_ROOT = "/tmp";

describe("parseDescriptionTags", () => {
  it("should return empty string for empty description", () => {
    expect(parseDescriptionTags("", DUMMY_FOLDER, DUMMY_ROOT)).toBe("");
  });

  it("should escape plain HTML text", () => {
    const result = parseDescriptionTags(
      "Hello <script>alert('xss')</script>",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).not.toContain("<script>");
    expect(result).toContain("&lt;script&gt;");
  });

  it("should convert LINE tags to <br>", () => {
    const result = parseDescriptionTags(
      "Line1<LINE>Line2",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toBe("Line1<br>Line2");
  });

  it("should convert BR tags to double <br>", () => {
    const result = parseDescriptionTags(
      "Line1<BR>Line2",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toBe("Line1<br><br>Line2");
  });

  it("should convert SPACE tags to space character", () => {
    const result = parseDescriptionTags(
      "Hello<SPACE>World",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toBe("Hello World");
  });

  it("should convert H1 to centered large heading span", () => {
    const result = parseDescriptionTags(
      "<H1>Title",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toBe('<span class="pz-h1">Title</span>');
  });

  it("should convert H2 to left-aligned medium heading span", () => {
    const result = parseDescriptionTags(
      "<H2>Section",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toBe('<span class="pz-h2">Section</span>');
  });

  it("should handle TEXT tag to reset formatting", () => {
    const result = parseDescriptionTags(
      "<H1>Title<TEXT>Normal",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toBe('<span class="pz-h1">Title</span>Normal');
  });

  it("should handle RED color tag", () => {
    const result = parseDescriptionTags(
      "<RED>Red text",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toBe('<span style="color: rgb(255,0,0)">Red text</span>');
  });

  it("should handle ORANGE color tag", () => {
    const result = parseDescriptionTags(
      "<ORANGE>Orange text",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toBe('<span style="color: rgb(255,165,0)">Orange text</span>');
  });

  it("should handle GREEN color tag", () => {
    const result = parseDescriptionTags(
      "<GREEN>Green text",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toBe('<span style="color: rgb(0,255,0)">Green text</span>');
  });

  it("should handle GHC tag", () => {
    const result = parseDescriptionTags(
      "<GHC>Good color",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toContain("var(--ghc");
  });

  it("should handle BHC tag", () => {
    const result = parseDescriptionTags(
      "<BHC>Bad color",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toContain("var(--bhc");
  });

  it("should handle RGB tag", () => {
    const result = parseDescriptionTags(
      "<RGB:100,200,50>Custom color",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toBe('<span style="color: rgb(100,200,50)">Custom color</span>');
  });

  it("should handle PUSHRGB and POPRGB color stack", () => {
    const result = parseDescriptionTags(
      "<PUSHRGB:255,0,0>Red<POPRGB>Back to default",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toContain("rgb(255,0,0)");
    expect(result).toContain("Back to default");
  });

  it("should handle CENTRE alignment", () => {
    const result = parseDescriptionTags(
      "<CENTRE>Centered",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toBe('<span class="pz-align-centre">Centered</span>');
  });

  it("should handle LEFT alignment", () => {
    const result = parseDescriptionTags(
      "<LEFT>Left aligned",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toBe('<span class="pz-align-left">Left aligned</span>');
  });

  it("should handle RIGHT alignment", () => {
    const result = parseDescriptionTags(
      "<RIGHT>Right aligned",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toBe('<span class="pz-align-right">Right aligned</span>');
  });

  it("should handle SIZE tags", () => {
    const result = parseDescriptionTags(
      "<SIZE:small>Small<SIZE:large>Large<SIZE:medium>Medium",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toContain("pz-size-small");
    expect(result).toContain("pz-size-large");
    expect(result).toContain("pz-size-medium");
  });

  it("should handle INDENT tag", () => {
    const result = parseDescriptionTags(
      "<INDENT:30>Indented text",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toContain("padding-left: 30px");
  });

  it("should strip SETX tag", () => {
    const result = parseDescriptionTags(
      "<SETX:100>Text",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toBe("Text");
  });

  it("should show fallback for IMAGE with non-existent path", () => {
    const result = parseDescriptionTags(
      "<IMAGE:nonexistent.png,100,200>",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toContain("[IMAGE:nonexistent.png,100,200]");
  });

  it("should show fallback for IMAGECENTRE with non-existent path", () => {
    const result = parseDescriptionTags(
      "<IMAGECENTRE:nonexistent.png>",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toContain("[IMAGECENTRE:nonexistent.png]");
  });

  it("should handle JOYPAD tag", () => {
    const result = parseDescriptionTags(
      "<JOYPAD:A,32,32>",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toContain("pz-joypad");
    expect(result).toContain("Joypad: A");
  });

  it("should handle VIDEOCENTRE tag", () => {
    const result = parseDescriptionTags(
      "<VIDEOCENTRE:intro.bik,640,360>",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toContain("[Video: intro.bik]");
  });

  it("should escape unknown tags", () => {
    const result = parseDescriptionTags(
      "<UNKNOWN_TAG>",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toBe("&lt;UNKNOWN_TAG&gt;");
  });

  it("should handle text with no tags correctly", () => {
    const result = parseDescriptionTags(
      "Plain text without any tags at all",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toBe("Plain text without any tags at all");
  });

  it("should handle multiple lines with H1 and BR", () => {
    const result = parseDescriptionTags(
      "<H1>My Mod<BR><TEXT>Welcome to my mod.<LINE>Enjoy!",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toContain("pz-h1");
    expect(result).toContain("<br>");
  });

  it("should merge consecutive text with same format into single span", () => {
    const result = parseDescriptionTags(
      "<RED>Red word1<LINE>Red word2<LINE>Red word3",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toBe('<span style="color: rgb(255,0,0)">Red word1<br>Red word2<br>Red word3</span>');
  });

  it("should handle H1 with embedded LINE", () => {
    const result = parseDescriptionTags(
      "<H1>Title Line 1<LINE>Title Line 2",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toBe('<span class="pz-h1">Title Line 1<br>Title Line 2</span>');
  });

  it("should handle INDENT with negative value (clamped to 0)", () => {
    const result = parseDescriptionTags(
      "<INDENT:-10>Text",
      DUMMY_FOLDER,
      DUMMY_ROOT,
    );
    expect(result).toContain("padding-left: 0px");
  });
});
