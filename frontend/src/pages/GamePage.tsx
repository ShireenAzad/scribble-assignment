import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { GuessForm } from "../components/GuessForm";
import { ResultPanel } from "../components/ResultPanel";
import { RoomCodeBadge } from "../components/RoomCodeBadge";
import { Scoreboard } from "../components/Scoreboard";
import { useRoomState, useRoomStore } from "../state/roomStore";

export function GamePage() {
  const navigate = useNavigate();
  const roomStore = useRoomStore();
  const { room, participantId } = useRoomState();

  useEffect(() => {
    if (!room) {
      navigate("/", { replace: true });
      return;
    }

    const interval = setInterval(async () => {
      try {
        await roomStore.fetchRoom();
      } catch (e) {
        console.error("Polling failed", e);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [navigate, room, roomStore]);

  if (!room) {
    return null;
  }

  const viewer = room.participants.find((participant) => participant.id === participantId) ?? null;
  const isDrawer = room.isDrawer;

  async function handleDraw() {
    if (!isDrawer) return;
    try {
      await roomStore.draw("drawn");
    } catch (e) {
      console.error("Draw failed", e);
    }
  }

  async function handleClear() {
    if (!isDrawer) return;
    try {
      await roomStore.draw("");
    } catch (e) {
      console.error("Clear failed", e);
    }
  }

  return (
    <section className="panel game-page">
      <div className="game-page__header">
        <div className="game-page__header-left">
          <span className="section-kicker">
            {isDrawer ? "You are the Drawer" : "You are a Guesser"} — Round 1
          </span>
          <h1 className="game-page__title">
            {isDrawer ? `Draw: ${room.secretWord}` : "Guess the Word!"}
          </h1>
        </div>
        <RoomCodeBadge code={room.code} />
      </div>

      <div className="game-page__layout">
        <aside className="game-page__sidebar game-page__sidebar--left">
          <Scoreboard />
          <ResultPanel />
        </aside>

        <div className="game-page__main">
          <Card title="Canvas">
            <div
              className="canvas-placeholder"
              onClick={handleDraw}
              style={{
                minHeight: "500px",
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7280",
                cursor: isDrawer ? "pointer" : "default"
              }}
            >
              {room.canvasData === "drawn" ? (
                <div style={{ fontSize: "2rem", color: "#3b82f6" }}>🎨 Something was drawn!</div>
              ) : isDrawer ? (
                "Click here to 'draw' something"
              ) : (
                "Watching the drawer draw..."
              )}
            </div>
            {isDrawer && (
              <div className="button-row" style={{ marginTop: "16px" }}>
                <button className="button button--secondary" onClick={handleClear}>
                  Clear Canvas
                </button>
              </div>
            )}
          </Card>

          <Card title="Guess History">
            {room.guesses.length === 0 ? (
              <p>No guesses yet.</p>
            ) : (
              <ul className="player-list">
                {[...room.guesses].reverse().map((guess, index) => (
                  <li
                    key={index}
                    style={{
                      borderLeft: guess.isCorrect ? "4px solid #10b981" : "4px solid #ef4444",
                      paddingLeft: "8px"
                    }}
                  >
                    <strong>{guess.playerName}:</strong> {guess.text}
                    {guess.isCorrect && (
                      <span style={{ color: "#059669", marginLeft: "8px" }}>(Correct!)</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <aside className="game-page__sidebar game-page__sidebar--right">
          <Card title="Player Info">
            <dl className="detail-list">
              <div>
                <dt>Name</dt>
                <dd>{viewer?.name ?? "Unknown player"}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{isDrawer ? "Drawer" : "Guesser"}</dd>
              </div>
            </dl>
          </Card>

          {!isDrawer && (
            <Card title="Your Guess">
              <GuessForm />
            </Card>
          )}
        </aside>
      </div>

      <div className="button-row">
        <button className="button button--secondary" onClick={() => navigate("/lobby")}>
          Exit Game
        </button>
      </div>
    </section>
  );
}
