import React, { useEffect, useState, useMemo } from 'react';
import { render } from 'react-dom';
import EdgeForm from './components/EdgeForm';
import OptionsForm from './components/OptionsForm';
import NodeForm from './components/NodeForm';
import Palette from './components/Palette';
import renderNode, { isTask } from './components/renderNode';
import './index.scss';
import {Workflow} from '../src';
import getSugiyamaCoords from '../src';


let index = 11;
const getId = () => index++;

function App() {
  const [cur, setCur] = useState(null);
  const [nodes, setNodes] = useState(initNodes());
  const [edges, setEdges] = useState([
    { from: 1, to: 2 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 3, to: 6 },
    { from: 3, to: 7 },
    { from: 6, to: 8 },
    { from: 7, to: 8 },
    { from: 4, to: 5 },
    { from: 5, to: 8 },
    { from: 8, to: 9 }
  ]);

  function initNodes() {
    let arr = [...Array(10).keys()].slice(1,);
    let objArr = [];
    for(let ind of arr) {
      objArr.push({
        id: ind,
        type: 'task',
        name: `Task ${ind}`
      })
    }
    //console.log(objArr);
    return objArr;
  }
  
  const [options, setOptions] = useState({
    ltor: false,
    layerMargin: 40,
    vertexMargin: 40,
    edgeMargin: 150,
    vertexWidth: () => {return 58},
    vertexHeight: () => {return 196}
  });
  const data = useMemo(() => ({
    nodes: nodes.map(n => {
      const cls = [];
      if (isTask(n.type)) {
        cls.push('node-task');
      } else {
        cls.push('node-event-gateway');
      }
      if (n.id === cur) {
        cls.push('node-active');
      }
      return { ...n, className: cls.join(' ') };
    }),
    edges
  }), [nodes, edges, cur]);

  useEffect(() => {
    const handle = (e) => {
      for (let t = e.target; t && t !== document; t = t.parentNode) {
        if (t.matches('.main')) {
          setCur(null);
          break;
        }
      }
    };
    document.addEventListener('click', handle, true);
    return () => {
      document.removeEventListener('click', handle, true);
    };
  }, []);

  const addNode = (type, text) => setNodes(prev => {
    const id = getId();
    const name = `${text} ${id}`;
    return [...prev, { id, type, name }];
  });
  const addEdge = (start, end) => setEdges(
    prev => ([...prev, { from: start, to: end }])
  );
  const delEdge = (start, end) => setEdges(
    prev => prev.filter(v => (v.from !== start || v.to !== end))
  );
  const onSelect = (v, e) => {
    e.preventDefault();
    setCur(v.id);
  };
  const setOption = (k, v) => setOptions(
    prev => ({ ...prev, [k]: v })
  );
  const node = nodes.find(v => v.id === cur);
  const setNode = (id, obj) => setNodes(
    prev => prev.map(n => {
      if (n.id === id) {
        return { ...n, ...obj };
      }
      return n;
    })
  );
  //console.log("sugiyama");
  console.log(getSugiyamaCoords(nodes, edges, options));
  
  return (
    <div className="container">
      <Palette onAdd={addNode} />
      <div className="main">
        <Workflow
          data={data}
          renderNode={renderNode}
          onSelect={onSelect}
          options={options}
        />
      </div>
      <div className="sidebar">
        <EdgeForm nodes={nodes} onAdd={addEdge} onDelete={delEdge} />
        <OptionsForm value={options} onChange={setOption} />
        <NodeForm node={node} onChange={setNode} />
      </div>
    </div>
  );
}

render(
  <App />,
  document.getElementById('root')
);
