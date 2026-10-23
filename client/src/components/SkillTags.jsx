import { useEffect, useState } from "react";

export default function SkillTags({ token }) {
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");
  const [editing, setEditing] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState("");

  function authHeaders() {
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // Sends a request and updates the list from the response.
  async function callApi(path, options = {}) {
    setError("");
    try {
      const response = await fetch(`/api/students/me/skills${path}`, {
        ...options,
        headers: authHeaders(),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Something went wrong.");
      setSkills(data.skills || []);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  }

  useEffect(() => {
    let active = true;

    async function loadSkills() {
      try {
        const response = await fetch("/api/students/me/skills", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Unable to load skills.");
        if (active) setSkills(data.skills || []);
      } catch (err) {
        if (active) setError(err.message);
      }
    }

    loadSkills();
    return () => { active = false; };
  }, [token]);

  async function handleAdd(event) {
    event.preventDefault();
    if (await callApi("", { method: "POST", body: JSON.stringify({ skill: newSkill }) })) {
      setNewSkill("");
    }
  }

  async function handleSaveEdit(skill) {
    if (
      await callApi(`/${encodeURIComponent(skill)}`, {
        method: "PUT",
        body: JSON.stringify({ skill: editValue }),
      })
    ) {
      setEditing(null);
    }
  }

  function handleDelete(skill) {
    callApi(`/${encodeURIComponent(skill)}`, { method: "DELETE" });
  }

  return (
    <section>
      <h2>My Skills</h2>

      <form onSubmit={handleAdd}>
        <label htmlFor="newSkill">Add a skill</label>
        <input
          id="newSkill"
          value={newSkill}
          onChange={(event) => setNewSkill(event.target.value)}
          placeholder="e.g. react"
        />
        <button type="submit">Add</button>
      </form>

      {error && <p role="alert">{error}</p>}

      {skills.length === 0 ? (
        <p>No skills added yet.</p>
      ) : (
        <ul>
          {skills.map((skill) => (
            <li key={skill}>
              {editing === skill ? (
                <>
                  <input
                    aria-label={`Edit ${skill}`}
                    value={editValue}
                    onChange={(event) => setEditValue(event.target.value)}
                  />
                  <button type="button" onClick={() => handleSaveEdit(skill)}>Save</button>
                  <button type="button" onClick={() => setEditing(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <span>{skill}</span>{" "}
                  <button
                    type="button"
                    onClick={() => { setEditing(skill); setEditValue(skill); }}
                  >
                    Edit
                  </button>
                  <button type="button" onClick={() => handleDelete(skill)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
