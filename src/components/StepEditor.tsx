import { AutomationStep, ACTION_ICONS, ACTION_LABELS, ACTION_DESCRIPTIONS } from '@/lib/automation';
import { X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useState } from 'react';
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { CallbackResponse, contentTracing } from 'electron';

interface StepEditorProps {
  step: AutomationStep;
  index: number;
  onChange: (step: AutomationStep) => void;
  onRemove: () => void;

}

const inputCls =
  'bg-background border border-border rounded px-2 py-1 text-xs text-foreground outline-none focus:border-primary transition-colors';

export default function StepEditor({ step, index, onChange, onRemove, }: StepEditorProps) {
  const set = (patch: Partial<AutomationStep>) => onChange({ ...step, ...patch });
  const [Stack, setStack] = useState("")
  const [DisabledInputHelp, setDisabledInputHelp] = useState(false)
  const [Info, setInfo] = useState(false)
  const [valueHELP, setValueHELP] = useState("")
  const [colorHELP, setcolorHELP] = useState("")
  const [valueInputHelp, setValueInputHelp] = useState("")
  async function WriteIntheHelp(text: string, setText: (value: string) => void): Promise<void> {
    let resultado = ""
    for (const char of text) {
      resultado += char
      setText(resultado)
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  return (
    <div className="flex items-start gap-2 p-3 rounded bg-secondary/50 border border-border group">
      {/* Índice */}
      <span className="text-[10px] text-muted-foreground pt-1 w-4 text-center select-none">
        {index + 1}
      </span>

      {/* Conteúdo do passo */}
      <div className="flex-1 space-y-2 min-w-0">
        {/* Cabeçalho do tipo */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-primary text-sm">{ACTION_ICONS[step.type]}</span>
          <span className="text-xs font-semibold text-foreground">{ACTION_LABELS[step.type]}</span>
          <span className="text-[10px] text-muted-foreground hidden sm:inline">
            — {ACTION_DESCRIPTIONS[step.type]}
          </span>
        </div>

        {/* Campos por tipo */}
        {(step.type === 'open' || step.type === 'script') && (
          <div className='flex flex-row'>
            <input
              className={`${inputCls} w-full`}
              value={step.path}
              onChange={e => set({ path: e.target.value })}
              placeholder={
                step.type === 'open'
                  ? 'C:\\Caminho\\para\\programa.exe'
                  : 'C:\\Caminho\\para\\script.bat'
              }
            />
            <button className={`${inputCls}`} onClick={async () => {
              console.log(step.type)
              await window.electronAPI.GetPath(step.type).then((data) => {
                if (data.saida == "Operação cancelada") {
                  return
                }
                step.path = data.saida
                onChange(step)
              })
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><rect width="24" height="24" fill="none" /><path fill="#fff" d="M4.616 19q-.691 0-1.153-.462T3 17.384V6.616q0-.691.463-1.153T4.615 5h4.31q.323 0 .628.13q.305.132.522.349L11.596 7h7.789q.69 0 1.153.463T21 8.616v8.769q0 .69-.462 1.153T19.385 19zm0-1h14.769q.269 0 .442-.173t.173-.442v-8.77q0-.269-.173-.442T19.385 8h-8.19L9.366 6.173q-.096-.096-.202-.134Q9.06 6 8.946 6h-4.33q-.269 0-.442.173T4 6.616v10.769q0 .269.173.442t.443.173M4 18V6z" /></svg>
            </button>
          </div>
        )}

        {step.type === 'script' && (
          <div className='flex flex-col'>
            <div className='flex flex-row gap-2'>
              <button className='border-2 border-green-950 bg-background rounded-lg pl-3 pr-3 focus:border-green-600 hover:border-green-400 transition-colors duration-300' onClick={() => {
                setStack(".py")
                console.log(Stack)
              }}>.py</button>
              <button className='border-2 border-green-950 bg-background rounded-lg pl-3 pr-3 focus:border-green-600 hover:border-green-400 transition-colors duration-300' onClick={() => {
                setStack(".cpp")
              }}>.cpp</button>
              <button className='border-2 border-green-950 bg-background rounded-lg pl-3 pr-3 focus:border-green-600 hover:border-green-400 transition-colors duration-300' onClick={() => {
                setStack(".cs")
              }}>.cs</button>
              <button className='border-2 border-green-950 bg-background rounded-lg pl-3 pr-3 focus:border-green-600 hover:border-green-400 transition-colors duration-300' onClick={() => {
                setStack(".c")
              }}>.c</button>
              <button className='border-2 border-green-950 bg-background rounded-lg pl-3 pr-3 focus:border-green-600 hover:border-green-400 transition-colors duration-300' onClick={() => {
                setStack(".ps1")
              }}>.ps1</button>

              <button className='border-2 border-green-950 bg-background rounded-lg pl-3 pr-3 focus:border-green-600 hover:border-green-400 transition-colors duration-300' onClick={() => {
                setInfo(true)
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24"><path fill="#7bea4e" d="M11 17h2v-6h-2zm1.713-8.287Q13 8.425 13 8t-.288-.712T12 7t-.712.288T11 8t.288.713T12 9t.713-.288M12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"></path></svg>
              </button>
            </div>
            {Info == true && (
              //treco aqui zé
              <div className='absolute w-full h-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-center items-center'>
                <div className='flex flex-col bg-background border-2 border-green-950/2 h-1/2 backdrop-blur-x1 w-1/5 ml-auto mr-32 justify-start pl-5 pr-5'>
                  <div className='flex flex-row'>
                    <h1 className='mr-auto font-extralight text-xl flex flex-row gap-2 mt-6 mb-2'>
                      <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24"><g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"></path><path fill="#7bea4e" d="M20 17a1 1 0 0 1 .117 1.993L20 19h-8a1 1 0 0 1-.117-1.993L12 17zM3.636 5.636a1 1 0 0 1 1.32-.083l.094.083l5.657 5.657a1 1 0 0 1 .083 1.32l-.083.094l-5.657 5.657a1 1 0 0 1-1.497-1.32l.083-.094L8.586 12l-4.95-4.95a1 1 0 0 1 0-1.414"></path></g></svg>
                      Ajuda</h1>
                    <button className='mt-3' onClick={() => setInfo(false)}>
                      <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24"><path fill="#7d7d7d" d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z"></path></svg>
                    </button>
                  </div>
                  <input type="text" className='relative bg-background border-2 border-green-950/2 h-8 rounded-lg outline-none pl-3  mb-2 focus:border-green-500 transition-colors duration-300' placeholder='Command: -help' value={valueInputHelp} onChange={(e) => setValueInputHelp(e.target.value)} onKeyDown={(e) => {
                    if (e.key == "Enter") {
                      if (valueInputHelp == "--help") {
                        setcolorHELP("text-green-500")
                        WriteIntheHelp("[NODE] load args for user\n\n[NODE] load system callbacks\n\n\n========================\n\n .py => Python\n\n .cpp => C++\n\n .cs => C#\n\n .c => C\n\n .ps1 => Powershell", setValueHELP)
                        setDisabledInputHelp(true)
                      } 
                      else if(valueInputHelp == ""){
                        setcolorHELP("text-red-500")
                        WriteIntheHelp("Error: Digite o comando \n\n --help \n\n no input acima..", setValueHELP)
                      }
                      else {
                        setcolorHELP("text-red-500")
                        WriteIntheHelp("Error Fatal: Comando não reconhecido", setValueHELP)
                      }
                    }
                  }} />
                  <p className='text-xs'>--Help para obter ajuda</p>
                  <textarea className={`${inputCls} w-full h-full text-left mb-5 leading-none pl-4 pt-4 ${colorHELP}`} disabled={DisabledInputHelp} value={valueHELP} onChange={(e) => setValueHELP(e.target.value)}>

                  </textarea>
                </div>
              </div>
            )}
          </div>
        )}

        {step.type === 'mouse' && (
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-muted-foreground">X:</label>
            <input
              type="number"
              className={`${inputCls} w-20`}
              value={step.x ?? 0}
              onChange={e => set({ x: Number(e.target.value) })}
            />
            <label className="text-[10px] text-muted-foreground">Y:</label>
            <input
              type="number"
              className={`${inputCls} w-20`}
              value={step.y ?? 0}
              onChange={e => set({ y: Number(e.target.value) })}
            />
          </div>
        )}

        {step.type === 'click' && (
          <div className="flex items-center gap-2">
            <label className="text-[10px] text-muted-foreground">Botão:</label>
            <select
              className={`${inputCls} cursor-pointer`}
              value={step.button ?? 'left'}
              onChange={e => set({ button: e.target.value as 'left' | 'right' })}
            >
              <option value="left">Esquerdo</option>
              <option value="right">Direito</option>
            </select>
          </div>
        )}

        {step.type === 'write' && (
          <input
            className={`${inputCls} w-full`}
            value={step.text ?? ''}
            onChange={e => set({ text: e.target.value })}
            placeholder="Texto que será digitado..."
          />
        )}

        {step.type === 'delay' && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              className={`${inputCls} w-24`}
              value={step.ms ?? 1000}
              min={0}
              onChange={e => set({ ms: Number(e.target.value) })}
            />
            <span className="text-[10px] text-muted-foreground">ms (1000 = 1 segundo)</span>
          </div>
        )}

        {step.type === 'loop' && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">Repetir:</span>
            <input
              type="number"
              className={`${inputCls} w-16`}
              value={step.count ?? 1}
              min={1}
              onChange={e => set({ count: Number(e.target.value) })}
            />
            <span className="text-[10px] text-muted-foreground">vezes</span>
            <span className="text-[10px] text-muted-foreground ml-2">
              (sub-passos: {step.steps?.length ?? 0})
            </span>
          </div>
        )}


      </div>

      {/* Remover */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onRemove}
            className="p-1 text-muted-foreground hover:text-destructive transition-colors shrink-0"
          >
            <X size={13} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Remover esta ação</p>
        </TooltipContent>
      </Tooltip>
    </div>

  );
}
