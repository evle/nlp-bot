import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'training-data.json');

async function readData() {
  const data = await fs.readFile(dataFilePath, 'utf-8');
  return JSON.parse(data).data;
}

async function writeData(data: any[]) {
  await fs.writeFile(dataFilePath, JSON.stringify({ data }, null, 2));
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updatedData = await req.json();
    const data = await readData();
    const index = data.findIndex((item: any) => item.id === params.id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Data not found' },
        { status: 404 }
      );
    }

    data[index] = updatedData;
    await writeData(data);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update training data' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await readData();
    const filteredData = data.filter((item: any) => item.id !== params.id);
    await writeData(filteredData);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete training data' },
      { status: 500 }
    );
  }
} 