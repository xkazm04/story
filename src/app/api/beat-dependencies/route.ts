import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import { v4 as uuidv4 } from 'uuid';

const DB_PATH = process.env.DB_PATH || './database/goals.db';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');
  const beatId = searchParams.get('beatId');

  if (!projectId && !beatId) {
    return NextResponse.json(
      { error: 'Either projectId or beatId is required' },
      { status: 400 }
    );
  }

  try {
    const db = new Database(DB_PATH);

    let query = `
      SELECT bd.*,
        sb.name as source_name,
        tb.name as target_name
      FROM beat_dependencies bd
      LEFT JOIN beats sb ON bd.source_beat_id = sb.id
      LEFT JOIN beats tb ON bd.target_beat_id = tb.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (beatId) {
      query += ' AND (bd.source_beat_id = ? OR bd.target_beat_id = ?)';
      params.push(beatId, beatId);
    } else if (projectId) {
      query += ' AND sb.project_id = ?';
      params.push(projectId);
    }

    const stmt = db.prepare(query);
    const dependencies = stmt.all(...params);
    db.close();

    return NextResponse.json(dependencies);
  } catch (error) {
    console.error('Error fetching beat dependencies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch beat dependencies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { source_beat_id, target_beat_id, dependency_type, strength } = body;

    if (!source_beat_id || !target_beat_id) {
      return NextResponse.json(
        { error: 'source_beat_id and target_beat_id are required' },
        { status: 400 }
      );
    }

    const db = new Database(DB_PATH);
    const id = uuidv4();

    const stmt = db.prepare(`
      INSERT INTO beat_dependencies (
        id, source_beat_id, target_beat_id, dependency_type, strength
      ) VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      source_beat_id,
      target_beat_id,
      dependency_type || 'sequential',
      strength || 'required'
    );

    const newDependency = db
      .prepare('SELECT * FROM beat_dependencies WHERE id = ?')
      .get(id);

    db.close();

    return NextResponse.json(newDependency, { status: 201 });
  } catch (error) {
    console.error('Error creating beat dependency:', error);
    return NextResponse.json(
      { error: 'Failed to create beat dependency' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Dependency id is required' },
      { status: 400 }
    );
  }

  try {
    const db = new Database(DB_PATH);
    const stmt = db.prepare('DELETE FROM beat_dependencies WHERE id = ?');
    stmt.run(id);
    db.close();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting beat dependency:', error);
    return NextResponse.json(
      { error: 'Failed to delete beat dependency' },
      { status: 500 }
    );
  }
}
