import React from "react";

export default function About() {
  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-center">
      <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-primary via-accent to-purple-600 bg-clip-text text-transparent">About Us</h1>
      <p className="text-lg mb-6 text-muted-foreground">
        Our mission is to empower sellers, connect buyers, and help online businesses grow—no matter their size or experience.
      </p>
      <div className="bg-primary/5 rounded-xl p-6 mb-6 text-foreground">
        <h2 className="text-xl font-bold mb-2">Our Story</h2>
        <p>
          The idea for this marketplace was born when a small group of friends noticed how hard it was for local entrepreneurs to get started online. We wanted to create a platform that removes barriers, makes selling simple, and brings communities together. What makes us unique? We believe in <span className="font-semibold text-primary">openness, fairness, and real support</span>—for everyone.
        </p>
      </div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-1">Meet the Team</h2>
        <p className="text-base text-muted-foreground">Founded by Walid and friends, our team is passionate about building tools that make a difference. We’re here to help you succeed!</p>
      </div>
      <p className="text-sm text-muted-foreground">Want to get in touch? <a href="/contact" className="text-primary underline">Contact us</a>.</p>
    </div>
  );
}
