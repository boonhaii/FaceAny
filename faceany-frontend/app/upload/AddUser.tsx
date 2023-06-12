"use client";
import { useState } from "react";
import Button from "../button";

interface Props {
  onSubmit: (name: string) => void;
  className?: string;
}
export const AddUser = ({ onSubmit, className }: Props) => {
  const [name, setName] = useState("");
  return (
    <div className={className}>
      <p>Add a User</p>
      <input
        className="text-black"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button onClick={() => onSubmit(name)}>Submit!</Button>
    </div>
  );
};
