import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

const DB_PATH = process.env.DB_PATH || './database/goals.db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const beatId = searchParams.get('beatId');
  const applied = searchParams.get('applied');

  if (!projectId && !beatId) {
    return NextResponse.json(
      { error: 'Either projectId or beatId is required' },
      { status: 400 }
    );
  }

  try {
    const db = new Database(DB_PATH);

    let query = `
      SELECT bps.*,
        b.name as beat_name
      FROM beat_pacing_suggestions bps
      LEFT JOIN beats b ON bps.beat_id = b.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (beatId) {
      query += ' AND bps.beat_id = ?';
      params.push(beatId);
    } else if (projectId) {
      query += ' AND bps.project_id = ?';
      params.push(projectId);
    }

    if (applied !== null) {
      query += ' AND bps.applied = ?';
      params.push(applied === 'true' ? 1 : 0);
    }

    query += ' ORDER BY bps.confidence DESC, bps.created_at DESC';

    const stmt = db.prepare(query);
    const suggestions = stmt.all(...params);
    db.close();

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error('Error fetching pacing suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pacing suggestions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      project_id,
      beat_id,
      suggestion_type,
      suggested_order,
      suggested_duration,
      reasoning,
      confidence,
    } = body;

    if (!project_id || !beat_id || !suggestion_type || !reasoning) {
      return NextResponse.json(
        { error: 'project_id, beat_id, suggestion_type, and reasoning are required' },
        { status: 400 }
      );
    }

    const db = new Database(DB_PATH);
    const id = uuidv4();

    const stmt = db.prepare(`
      INSERT INTO beat_pacing_suggestions (
        id, project_id, beat_id, suggestion_type, suggested_order,
        suggested_duration, reasoning, confidence, applied
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
    `);

    stmt.run(
      id,
      project_id,
      beat_id,
      suggestion_type,
      suggested_order || null,
      suggested_duration || null,
      reasoning,
      confidence || 0.5
    );

    const newSuggestion = db
      .prepare('SELECT * FROM beat_pacing_suggestions WHERE id = ?')
      .get(id);

    db.close();

    return NextResponse.json(newSuggestion, { status: 201 });
  } catch (error) {
    console.error('Error creating pacing suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to create pacing suggestion' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Suggestion id is required' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { applied } = body;

    const db = new Database(DB_PATH);
    const stmt = db.prepare(`
      UPDATE beat_pacing_suggestions
      SET applied = ?
      WHERE id = ?
    `);

    stmt.run(applied ? 1 : 0, id);

    const updatedSuggestion = db
      .prepare('SELECT * FROM beat_pacing_suggestions WHERE id = ?')
      .get(id);

    db.close();

    return NextResponse.json(updatedSuggestion);
  } catch (error) {
    console.error('Error updating pacing suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to update pacing suggestion' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Suggestion id is required' },
      { status: 400 }
    );
  }

  try {
    const db = new Database(DB_PATH);
    const stmt = db.prepare('DELETE FROM beat_pacing_suggestions WHERE id = ?');
    stmt.run(id);
    db.close();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting pacing suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to delete pacing suggestion' },
      { status: 500 }
    );
  }
}
