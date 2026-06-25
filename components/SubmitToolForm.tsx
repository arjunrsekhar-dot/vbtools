"use client";

import { CheckCircle2, ImagePlus, Info, Plus, Send, X } from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useState } from "react";
import { categories } from "@/lib/tools";
import { useApp } from "@/components/AppProvider";
import { Turnstile } from "@/components/Turnstile";
import { FileImagePreviews } from "@/components/ImagePreviews";
import { LoginPrompt } from "@/components/LoginPrompt";

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_LOGO_SIZE = 2 * 1024 * 1024;
const MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024;
type FieldErrors = Record<string, string>;

function FieldError({ name, errors }: { name: string; errors: FieldErrors }) {
  return errors[name] ? <small className="field-error" id={`${name}-error`}>{errors[name]}</small> : null;
}

export function SubmitToolForm() {
  const { user } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState(["Productivity"]);
  const [tag, setTag] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const handleCaptcha = useCallback((token: string) => {
    setCaptchaToken(token);
    if (token) {
      setFieldErrors((current) => {
        const next = { ...current };
        delete next.captchaToken;
        return next;
      });
    }
  }, []);

  function clearField(name: string) {
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function selectLogo(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type) || file.size > MAX_LOGO_SIZE) {
      setFieldErrors((current) => ({ ...current, logo: "Logo must be a PNG, JPG, or WebP image no larger than 2MB." }));
      return;
    }
    clearField("logo");
    setLogo(file);
  }

  function selectScreenshots(files: FileList | null) {
    const selected = Array.from(files || []);
    if (selected.length > 5) {
      setFieldErrors((current) => ({ ...current, screenshots: "You can upload up to 5 screenshots." }));
      return;
    }
    if (selected.some((file) => !IMAGE_TYPES.includes(file.type) || file.size > MAX_SCREENSHOT_SIZE)) {
      setFieldErrors((current) => ({ ...current, screenshots: "Each screenshot must be a PNG, JPG, or WebP image no larger than 5MB." }));
      return;
    }
    clearField("screenshots");
    setScreenshots(selected);
  }

  function validate(form: FormData) {
    const errors: FieldErrors = {};
    const value = (name: string) => String(form.get(name) || "").trim();
    const name = value("name");
    const websiteUrl = value("websiteUrl");
    const shortDescription = value("shortDescription");
    const fullDescription = value("fullDescription");

    if (name.length < 2) errors.name = "Enter at least 2 characters.";
    else if (name.length > 80) errors.name = "Use no more than 80 characters.";
    try {
      const url = new URL(websiteUrl);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    } catch {
      errors.websiteUrl = "Enter a complete URL beginning with http:// or https://.";
    }
    if (shortDescription.length < 20) errors.shortDescription = `Add ${20 - shortDescription.length} more character${20 - shortDescription.length === 1 ? "" : "s"} (20 minimum).`;
    else if (shortDescription.length > 150) errors.shortDescription = "Use no more than 150 characters.";
    if (!value("category")) errors.category = "Choose the closest category.";
    if (fullDescription.length < 40) errors.fullDescription = `Add ${40 - fullDescription.length} more character${40 - fullDescription.length === 1 ? "" : "s"} (40 minimum).`;
    else if (fullDescription.length > 5000) errors.fullDescription = "Use no more than 5,000 characters.";
    if (!captchaToken) errors.captchaToken = "Complete the security check before submitting.";
    return errors;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) {
      setLoginPromptOpen(true);
      return;
    }
    const form = new FormData(event.currentTarget);
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors);
      setError(`Please correct ${Object.keys(validationErrors).length} highlighted field${Object.keys(validationErrors).length === 1 ? "" : "s"}.`);
      window.requestAnimationFrame(() => {
        document.querySelector<HTMLElement>(".field-error")?.closest("label, .captcha-section")?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    form.set("tags", JSON.stringify(tags));
    form.set("captchaToken", captchaToken);
    if (logo) form.set("logo", logo);
    form.delete("screenshots");
    screenshots.forEach((file) => form.append("screenshots", file));
    setLoading(true);
    setError("");
    setFieldErrors({});
    const response = await fetch("/api/submissions", {
      method: "POST",
      body: form
    });
    if (response.ok) {
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      const data = await response.json() as { error?: string; fields?: FieldErrors };
      setError(data.error || "Could not submit the listing.");
      setFieldErrors(data.fields || {});
      setCaptchaToken("");
      setCaptchaReset((value) => value + 1);
    }
    setLoading(false);
  }

  if (submitted) {
    const dashboardHref = user?.role === "DEVELOPER" ? "/developer" : user?.role === "ADMIN" ? "/admin" : "/dashboard";
    return (
      <div className="submit-success"><span><CheckCircle2 size={35} /></span><h2>Your tool is in the review queue.</h2><p>We&apos;ll check the listing for quality and accuracy, usually within 2–3 business days.</p><Link className="button button-dark" href={dashboardHref}>Open dashboard</Link></div>
    );
  }

  return (
    <>
    {loginPromptOpen && (
      <LoginPrompt
        title="Log in to submit a tool"
        message="Tool submissions are attached to your account so admins can review the listing and keep you updated."
        next="/submit"
        close={() => setLoginPromptOpen(false)}
      />
    )}
    <form className="submit-form" onSubmit={submit} noValidate>
      <div className="form-section">
        <div className="form-section-heading"><span>01</span><div><h2>The basics</h2><p>Start with the essential details people use to recognize your tool.</p></div></div>
        <div className="form-grid">
          <label className="span-2"><span>Tool name * <em>2–80 characters</em></span><input name="name" aria-invalid={Boolean(fieldErrors.name)} aria-describedby={fieldErrors.name ? "name-error" : undefined} onChange={() => clearField("name")} placeholder="e.g. Acme Analytics" /><FieldError name="name" errors={fieldErrors} /></label>
          <label className="span-2"><span>Website URL * <em>Public http:// or https:// URL</em></span><input name="websiteUrl" type="url" aria-invalid={Boolean(fieldErrors.websiteUrl)} aria-describedby={fieldErrors.websiteUrl ? "websiteUrl-error" : undefined} onChange={() => clearField("websiteUrl")} placeholder="https://yourtool.com" /><FieldError name="websiteUrl" errors={fieldErrors} /></label>
          <label className="span-2"><span>Short description * <em>20–150 characters</em></span><input name="shortDescription" aria-invalid={Boolean(fieldErrors.shortDescription)} aria-describedby={fieldErrors.shortDescription ? "shortDescription-error" : undefined} onChange={() => clearField("shortDescription")} maxLength={150} placeholder="One clear sentence that explains what your tool does" /><small>Keep it useful and jargon-free. This appears on tool cards.</small><FieldError name="shortDescription" errors={fieldErrors} /></label>
          <label><span>Category *</span><select name="category" aria-invalid={Boolean(fieldErrors.category)} aria-describedby={fieldErrors.category ? "category-error" : undefined} onChange={() => clearField("category")} defaultValue=""><option value="" disabled>Choose a category</option>{categories.map((item) => <option key={item.slug}>{item.name}</option>)}</select><FieldError name="category" errors={fieldErrors} /></label>
          <label><span>Subcategory</span><input name="subcategory" placeholder="e.g. Email marketing" /></label>
        </div>
      </div>
      <div className="form-section">
        <div className="form-section-heading"><span>02</span><div><h2>Tell the story</h2><p>Help visitors understand when and why they should choose it.</p></div></div>
        <div className="form-grid">
          <label className="span-2"><span>Full description * <em>40–5,000 characters</em></span><textarea name="fullDescription" aria-invalid={Boolean(fieldErrors.fullDescription)} aria-describedby={fieldErrors.fullDescription ? "fullDescription-error" : undefined} onChange={() => clearField("fullDescription")} rows={7} placeholder="What does it do? Who is it for? What makes it different?" /><FieldError name="fullDescription" errors={fieldErrors} /></label>
          <label className="span-2"><span>Best for</span><input name="bestFor" placeholder="e.g. Small marketing teams and solo creators" /></label>
          <label className="span-2"><span>Tags</span><div className="tag-input">{tags.map((item) => <button type="button" key={item} onClick={() => setTags(tags.filter((value) => value !== item))}>{item}<X size={11} /></button>)}<input value={tag} onChange={(event) => setTag(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && tag.trim()) { event.preventDefault(); setTags([...tags, tag.trim()]); setTag(""); } }} placeholder="Type and press Enter" /></div></label>
        </div>
      </div>
      <div className="form-section">
        <div className="form-section-heading"><span>03</span><div><h2>Pricing & access</h2><p>Set expectations before someone clicks through.</p></div></div>
        <div className="form-grid">
          <label><span>Pricing type *</span><select name="pricingType" required defaultValue="Freemium"><option>Free</option><option>Freemium</option><option>Paid</option><option>Open Source</option></select></label>
          <label><span>Starting price</span><input name="startingPrice" placeholder="e.g. $12/month" /></label>
          <label><span>Coupon code</span><input name="couponCode" placeholder="Optional" /></label>
          <label><span>Discount details</span><input name="discountDetails" placeholder="e.g. 20% off for 3 months" /></label>
          <label className="span-2 checkbox-card"><input name="freeTrial" type="checkbox" value="true" /><span><strong>Free trial available</strong><small>Visitors can try the paid plan before purchasing.</small></span></label>
        </div>
      </div>
      <div className="form-section">
        <div className="form-section-heading"><span>04</span><div><h2>Make it visual</h2><p>A clear logo and screenshots help listings perform much better.</p></div></div>
        <div className="upload-grid">
          <label className={`upload-box ${logo ? "has-files" : ""}`}>
            <ImagePlus />
            <strong>{logo ? logo.name : "Upload logo"}</strong>
            <small>{logo ? `${(logo.size / 1024 / 1024).toFixed(2)}MB · Click to replace` : "PNG, JPG, or WebP · 2MB max"}</small>
            <input name="logo" type="file" accept=".png,.jpg,.jpeg,.webp" onChange={(event) => selectLogo(event.target.files)} />
            <FieldError name="logo" errors={fieldErrors} />
          </label>
          <label className={`upload-box wide ${screenshots.length ? "has-files" : ""}`}>
            <Plus />
            <strong>{screenshots.length ? `${screenshots.length} screenshot${screenshots.length === 1 ? "" : "s"} selected` : "Add screenshots"}</strong>
            <small>{screenshots.length ? screenshots.map((file) => file.name).join(", ") : "Up to 5 images · 5MB each"}</small>
            <input name="screenshots" type="file" accept=".png,.jpg,.jpeg,.webp" multiple onChange={(event) => selectScreenshots(event.target.files)} />
            <FieldError name="screenshots" errors={fieldErrors} />
          </label>
        </div>
        {logo && <FileImagePreviews files={[logo]} remove={() => setLogo(null)} />}
        <FileImagePreviews files={screenshots} remove={(index) => setScreenshots((current) => current.filter((_, itemIndex) => itemIndex !== index))} />
      </div>
      <div className="submission-note"><Info size={17} /><p>Every submission is reviewed by a human. You can edit the draft anytime; published changes require re-approval.</p></div>
      <div className="captcha-section">
        <strong>Security check *</strong>
        <Turnstile key={captchaReset} onToken={handleCaptcha} />
        <FieldError name="captchaToken" errors={fieldErrors} />
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-dark submit-button" disabled={loading}>{loading ? "Submitting…" : "Submit for review"} <Send size={16} /></button>
    </form>
    </>
  );
}
