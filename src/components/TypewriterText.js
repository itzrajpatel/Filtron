import React, { useState, useEffect } from "react";
import RobotWithSpeech from "../components/Robot";

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good Morning...";
  else if (hour >= 12 && hour < 17) return "Good Afternoon...";
  else return "Good Evening...";
};

const TypewriterText = () => {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [blink, setBlink] = useState(true);

  const greeting = getTimeGreeting();
  const texts = [greeting, "Welcome Mrudul Patel..."];

  useEffect(() => {
    if (subIndex === texts[index].length + 1 && !deleting) {
      setTimeout(() => setDeleting(true), 1000);
      return;
    }

    if (subIndex === 0 && deleting) {
      setDeleting(false);
      setIndex((prev) => (prev + 1) % texts.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => (deleting ? prev - 1 : prev + 1));
      setText(texts[index].substring(0, subIndex));
    }, 120);

    return () => clearTimeout(timeout);
  }, [subIndex, index, deleting, texts]);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink((prev) => !prev);
    }, 500);
    return () => clearInterval(blinkInterval);
  }, []);

  return (
    <RobotWithSpeech text={text} blink={blink} />
  );
};

export default TypewriterText;
