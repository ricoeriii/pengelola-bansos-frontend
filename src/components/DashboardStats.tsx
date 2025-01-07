import { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Button, Flex } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DashboardStats = () => {
  const [data, setData] = useState({
    totalLaporan: 0,
    jumlahPenerima: 0,
    wilayahTercakup: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get('http://localhost:3000/api/reports')
      .then((response) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const totalRecipientCount = response.data.reduce((sum: unknown, report: { recipientCount: any; }) => sum + report.recipientCount, 0);
        
        const uniqueRegions = new Set(response.data.map((report: { region: unknown; }) => report.region));
        const totalWilayahTercakup = uniqueRegions.size;

        setData({
          totalLaporan: response.data.length,
          jumlahPenerima: totalRecipientCount,
          wilayahTercakup: totalWilayahTercakup,
        });
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <Card className="shadow-lg rounded-lg" style={{ backgroundColor: 'white', width: '80%' }}>
        <Row gutter={16} className="text-center">
          <Col span={8}>
            <Card
              className="shadow-lg rounded-lg hover:shadow-2xl transition duration-300"
              style={{ backgroundColor: '#f0f5ff' }}
            >
              <Statistic
                title="Total Laporan"
                value={loading ? 'Loading...' : data.totalLaporan}
                valueStyle={{ color: '#1890ff', fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card
              className="shadow-lg rounded-lg hover:shadow-2xl transition duration-300"
              style={{ backgroundColor: '#e6f7ff' }}
            >
              <Statistic
                title="Jumlah Penerima"
                value={loading ? 'Loading...' : data.jumlahPenerima}
                valueStyle={{ color: '#52c41a', fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card
              className="shadow-lg rounded-lg hover:shadow-2xl transition duration-300"
              style={{ backgroundColor: '#fffbe6' }}
            >
              <Statistic
                title="Wilayah Tercakup"
                value={loading ? 'Loading...' : data.wilayahTercakup}
                valueStyle={{ color: '#faad14', fontSize: '24px' }}
              />
            </Card>
          </Col>
        </Row>
        <Flex justify='center' className='mt-4'>
          <Button type='primary' className='!justify-center' onClick={() => navigate('/reports')}>Tampilkan seluruh laporan</Button>
        </Flex>
      </Card>
    </div>
  );
};

export default DashboardStats;
