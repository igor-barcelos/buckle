import { useEffect, useRef, useState} from "react";
import { Model } from "../../model/Model";
import { AppContext } from "../../model/Context";
import Loading from "../../ui/Loading";
import NewHere from "../../ui/NewHere";
import Layout from "../../ui/Layout";

const Viewer = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);  
  const modelRef = useRef<Model | null>(null)
  const [model, setModel] = useState<Model | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    modelRef.current = Model.getInstance()
    setModel(modelRef.current)
    return () => {
      if (modelRef.current) {
        modelRef.current.dispose();
      }
    };
  }, []);

  return (  
    <>
    <AppContext.Provider value={{ model: model! }}>
      <Layout>
        <div id="app-container" ref={containerRef} style={{position:'relative', width:'100%', height:'100%', overflow: 'hidden',  margin: '0px'}} >
          {model && (
            <>
            <Loading open={loading}/>
            </>
          )}
        </div>
      </Layout>
    </AppContext.Provider>
    </>
  );
};

export default Viewer;