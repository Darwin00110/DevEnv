using System.Reflection.Metadata;
using System.Runtime.InteropServices;
class Mouse
{
    [DllImport("user32.dll")]
    static extern void mouse_event(uint dwFlags, uint dx, uint dy, uint dwData, UIntPtr dwExtraInfo);
    [DllImport("user32.dll")]
    static extern bool SetCursorPos(int x, int y);

    const int LEFTDOWN = 0x02;
    const int LEFTUP = 0x04;

    const int RIGHTDOWN = 0x08;
    const int RIGHTUP = 0x10;

    public static void Click(string button)
    {
        if (button == "left")
        {
            mouse_event(LEFTDOWN, 0, 0, 0, UIntPtr.Zero);
            mouse_event(LEFTUP, 0, 0, 0, UIntPtr.Zero);
        }
        if (button == "right")
        {
            mouse_event(RIGHTDOWN, 0, 0, 0, UIntPtr.Zero);
            mouse_event(RIGHTUP, 0, 0, 0, UIntPtr.Zero);
        }
    }
    public static void Move(int x, int y)
    {
        SetCursorPos(x, y);
    }
}

class Keyboard
{
    [DllImport("user32.dll")]
    static extern short VkKeyScan(char ch);

    [DllImport("user32.dll")]
    static extern void keybd_event(byte vk, byte scan, int flags, int extra);

    const int KEYEVENTF_KEYUP = 0x0002;

    const byte VK_RETURN = 0x0D;

    public static void PressEnter()
    {
        keybd_event(VK_RETURN, 0, 0, 0);
        keybd_event(VK_RETURN, 0, KEYEVENTF_KEYUP, 0);
    }

    public static void Write(string text)
    {
        foreach (char c in text)
        {
            short vkey = VkKeyScan(c);
            byte vk = (byte)(vkey & 0xff);

            keybd_event(vk, 0, 0, 0);
            keybd_event(vk, 0, KEYEVENTF_KEYUP, 0);

            Thread.Sleep(10);
        }
    }
}

class Program
{
    private static void ShowError()
    {
        Console.WriteLine(
        """
        ------------------------------------------------------
                 ______ _____  _____   ____  _____  
                |  ____|  __ \|  __ \ / __ \|  __ \ 
                | |__  | |__) | |__) | |  | | |__) |
                |  __| |  _  /|  _  /| |  | |  _  / 
                | |____| | \ \| | \ \| |__| | | \ \ 
                |______|_|  \_\_|  \_\\____/|_|  \_\

        ------------------------------------------------------

        >.Check all parameters before proceeding.                 

        """
        );
    }

    private static void ShowInfo()
    {
        Console.WriteLine(
        @"""
        ----------------------------------------------------
                     _____ _   _ ______ ____  
                    |_   _| \ | |  ____/ __ \ 
                      | | |  \| | |__ | |  | |
                      | | | . ` |  __|| |  | |
                     _| |_| |\  | |   | |__| |
                    |_____|_| \_|_|    \____/ 
        -----------------------------------------------------

        Modo mouse:
        1 param => mode
        2 param => x
        3 param => y
        4 param => button_mouse
        5 param => delay

        Modo text:
        1 param => mode
        2 param => text
        3 param => delay

        ------------------------------------------------------
        ",
        "");
    }

    private static void CoreMouse(string x, string y, string button_mouse, string delay)
    {
        try
        {
            int X = int.Parse(x);
            int Y = int.Parse(y);
            string Button = button_mouse;
            int Delay = int.Parse(delay);
            Mouse.Move(X, Y);
            Thread.Sleep(Delay);
            Mouse.Click(Button);
        }
        catch (Exception)
        {
            ShowError();
        }
    }

    private static void CoreText(string text, string delay)
    {
        try
        {
            string Text = text == null ? "" : text;
            int Delay = int.Parse(delay);
            Keyboard.Write(Text);
            Thread.Sleep(Delay);
            Keyboard.PressEnter();
        }
        catch (Exception)
        {
            ShowError();
        }
    }
    public static void Main(string[] args)
    {
        if (args.Length == 0)
        {
            ShowInfo();
            return;
        }

        string mode = args[0];

        if (mode == "mouse")
        {
            if (args.Length != 5)
            {
                ShowError();
                return;
            }

            string x = args[1];
            string y = args[2];
            string button_mouse = args[3];
            string delay = args[4];

            if (!int.TryParse(x, out _) || !int.TryParse(y, out _) || !int.TryParse(delay, out _))
            {
                ShowError();
                return;
            }

            CoreMouse(x, y, button_mouse, delay);
            return;
        }

        if (mode == "text")
        {
            if (args.Length != 3)
            {
                ShowError();
                return;
            }

            string text = args[1];
            string delay = args[2];

            if (!int.TryParse(delay, out _))
            {
                ShowError();
                return;
            }
            CoreText(text, delay);
            return;
        }

        ShowError();

    }
}
