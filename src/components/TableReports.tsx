import { JSXElementConstructor, ReactElement, ReactNode, ReactPortal, useEffect, useState } from 'react';
import { Table, Tag, Space, Button, Card, message, Input, Select, Flex, TableColumnsType } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { CaretLeftOutlined } from '@ant-design/icons';

type Report = {
  id: number;
  program: { name: string };
  recipientCount: number;
  distributionDate: string;
  region: string;
  proof: string;
  status: string;
};

const TableReports = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterProgram, setFilterProgram] = useState<string | undefined>(undefined);
  const [filterRegion, setFilterRegion] = useState<string | undefined>(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://localhost:3000/api/reports')
      .then((response) => {
        console.log('Data yang diterima:', response.data);
        setReports(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data", error);
        setLoading(false);
      });
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
      axios
        .delete(`http://localhost:3000/api/reports/${id}`)
        .then(() => {
          message.success('Laporan berhasil dihapus');
          setReports((prevReports) => prevReports.filter((report) => report.id !== Number(id)));
        })
        .catch((error) => {
          console.error("Error deleting data", error);
          message.error('Gagal menghapus laporan');
        });
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleProgramChange = (value: string | undefined) => {
    setFilterProgram(value);
  };

  const handleRegionChange = (value: string | undefined) => {
    setFilterRegion(value);
  };

  const filteredReports = reports.filter((report) => {
    const matchesProgram = filterProgram ? report.program.name === filterProgram : true;
    const matchesRegion = filterRegion ? report.region === filterRegion : true;
    const matchesSearch =
      report.program.name.toLowerCase().includes(search.toLowerCase()) ||
      report.region.toLowerCase().includes(search.toLowerCase());
    return matchesProgram && matchesRegion && matchesSearch;
  });

  const columns: TableColumnsType<Report> = [
    {
      title: 'Nama Program',
      dataIndex: ['program', 'name'],
      key: 'programName',
      render: (programName: string | number | boolean | ReactElement<unknown, string | JSXElementConstructor<unknown>> | Iterable<ReactNode> | ReactPortal | null | undefined) => <span>{programName}</span>,
      align: 'center',
    },
    {
      title: 'Wilayah',
      dataIndex: 'region',
      key: 'region',
      align: 'center',
    },
    {
      title: 'Jumlah Penerima',
      dataIndex: 'recipientCount',
      key: 'recipientCount',
      align: 'center',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status: string) => (
        <Tag color={status === 'Pending' ? 'orange' : status === 'Disetujui' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      render: (record: any) => (
        <Space size="middle">
          <Button type="link" danger onClick={() => handleDelete(record.id)}>Hapus</Button>
          <Button 
            type="link" 
            onClick={() => navigate(`/edit-report/${record.id}`)}
            className='text-yellow-500'
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ];

  const exportToCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredReports.map(report => ({
      'Nama Program': report.program.name,
      'Wilayah': report.region,
      'Jumlah Penerima': report.recipientCount,
      'Status': report.status,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports');
    XLSX.writeFile(workbook, 'laporan.csv');
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredReports.map(report => ({
      'Nama Program': report.program.name,
      'Wilayah': report.region,
      'Jumlah Penerima': report.recipientCount,
      'Status': report.status,
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports');
    XLSX.writeFile(workbook, 'laporan.xlsx');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text('Laporan Data', 10, 10);
    filteredReports.forEach((report, index) => {
      doc.text(`${index + 1}. Program: ${report.program.name}, Wilayah: ${report.region}, Jumlah Penerima: ${report.recipientCount}, Status: ${report.status}`, 10, 20 + index * 10);
    });
    doc.save('laporan.pdf');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
      <Card
        style={{
          width: '80%',
          maxWidth: '1200px',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        }}
        loading={loading}
      >
        <Flex justify='space-between'>
          <Button type="primary" danger className='!right-0 my-2' onClick={() => navigate('/')}><CaretLeftOutlined />Kembali ke Dashboard</Button>
          <Button type="primary" className='!right-0 my-2' onClick={() => navigate('/create-report')}>Buat Laporan</Button>
        </Flex>
        <Flex justify='end'>
          <div style={{ marginBottom: 16 }}>
            <Button type="default" onClick={exportToCSV} style={{ marginRight: 8 }}>Export to CSV</Button>
            <Button type="default" onClick={exportToExcel} style={{ marginRight: 8 }}>Export to Excel</Button>
            <Button type="default" onClick={exportToPDF}>Export to PDF</Button>
          </div>
        </Flex>

        <Flex justify='end'>
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Cari Program atau Wilayah"
            value={search}
            onChange={handleSearchChange}
            style={{ width: 300, marginRight: 16 }}
          />
          <Select
            placeholder="Filter berdasarkan Program"
            value={filterProgram}
            onChange={handleProgramChange}
            style={{ width: 200, marginRight: 16 }}
          >
            <Select.Option value={undefined}>Semua Program</Select.Option>
            {Array.from(new Set(reports.map((report) => report.program.name))).map((programName) => (
              <Select.Option key={programName} value={programName}>
                {programName}
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Filter berdasarkan Wilayah"
            value={filterRegion}
            onChange={handleRegionChange}
            style={{ width: 200 }}
          >
            <Select.Option value={undefined}>Semua Wilayah</Select.Option>
            {Array.from(new Set(reports.map((report) => report.region))).map((region) => (
              <Select.Option key={region} value={region}>
                {region}
              </Select.Option>
            ))}
          </Select>
        </div>
        </Flex>

        {/* Table with filtered data */}
        <Table columns={columns} dataSource={filteredReports} rowKey="id" />
      </Card>
    </div>
  );
};

export default TableReports;
