import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'training-data.json');

async function readData() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(data).data;
  } catch (error) {
    return [];
  }
}

async function writeData(data: any[]) {
  await fs.writeFile(dataFilePath, JSON.stringify({ data }, null, 2));
}

export async function GET() {
  const data = await readData();
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const newData = await req.json();
    const data = await readData();
    data.push(newData);
    await writeData(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add training data' },
      { status: 500 }
    );
  }
} 