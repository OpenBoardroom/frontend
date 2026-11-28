import { describe, expect, test } from "vitest";
import { canonicalUrl, MAX_QUERY, searchQuery } from "../app/lib/site";

describe("canonicalUrl", () => {
  test("joins the canonical host and the path", () => {
    expect(canonicalUrl("/")).toBe("https://openboardroom.org/");
    expect(canonicalUrl("/season")).toBe("https://openboardroom.org/season");
  });
});

describe("searchQuery", () => {
  const read = (query: string) =>
    searchQuery(new URL(`https://openboardroom.org/explore${query}`));

  test("trims the first q", () => {
    expect(read("?q=%20water%20")).toBe("water");
    expect(read("?q=a&q=b")).toBe("a");
  });

  test("is empty without a query", () => {
    expect(read("")).toBe("");
    expect(read("?q=%20%20")).toBe("");
  });

  test("caps a long query", () => {
    expect(MAX_QUERY).toBe(200);
    expect(read(`?q=${"x".repeat(10_000)}`)).toHaveLength(200);
  });

  test("leaves markup as text for the renderer to escape", () => {
    expect(read("?q=%3Cscript%3E")).toBe("<script>");
  });
});
