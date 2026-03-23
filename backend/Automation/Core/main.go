package main

import (
	"fmt"
	"os"
	"strconv"

	"github.com/go-vgo/robotgo"
)

func PainelPrincipal() {
	fmt.Println(`
========================================================================================================
========================================================================================================
     /$$$$$$              /$$                                         /$$     /$$                    
    /$$__  $$            | $$                                        | $$    |__/                    
   | $$  \ $$ /$$   /$$ /$$$$$$    /$$$$$$  /$$$$$$/$$$$   /$$$$$$  /$$$$$$   /$$  /$$$$$$  /$$$$$$$ 
   | $$$$$$$$| $$  | $$|_  $$_/   /$$__  $$| $$_  $$_  $$ |____  $$|_  $$_/  | $$ /$$__  $$| $$__  $$
   | $$__  $$| $$  | $$  | $$    | $$  \ $$| $$ \ $$ \ $$  /$$$$$$$  | $$    | $$| $$  \ $$| $$  \ $$
   | $$  | $$| $$  | $$  | $$ /$$| $$  | $$| $$ | $$ | $$ /$$__  $$  | $$ /$$| $$| $$  | $$| $$  | $$
   | $$  | $$|  $$$$$$/  |  $$$$/|  $$$$$$/| $$ | $$ | $$|  $$$$$$$  |  $$$$/| $$|  $$$$$$/| $$  | $$
   |__/  |__/ \______/    \___/   \______/ |__/ |__/ |__/ \_______/   \___/  |__/ \______/ |__/  |__/
                                                                                                  
========================================================================================================
========================================================================================================
---------
 Comands
---------
1-args x
2-args y
3-args write_message
4-args-beta Define the image if you want OpenCV to detect it. Note: OpenCV identifies the 
screenshot and tries to locate it on the screen; if it's visible, clicking on the image location triggers the action.
	`)
}

func ErrorPainel() {
	fmt.Println(`
====================================================
====================================================

 /$$$$$$$$ /$$$$$$$  /$$$$$$$   /$$$$$$  /$$$$$$$ 
| $$_____/| $$__  $$| $$__  $$ /$$__  $$| $$__  $$
| $$      | $$  \ $$| $$  \ $$| $$  \ $$| $$  \ $$
| $$$$$   | $$$$$$$/| $$$$$$$/| $$  | $$| $$$$$$$/
| $$__/   | $$__  $$| $$__  $$| $$  | $$| $$__  $$
| $$      | $$  \ $$| $$  \ $$| $$  | $$| $$  \ $$
| $$$$$$$$| $$  | $$| $$  | $$|  $$$$$$/| $$  | $$
|________/|__/  |__/|__/  |__/ \______/ |__/  |__/
                                                  
====================================================
====================================================

---------------------
Try again more later.
Execute Program with not arguments for more detal
--------------------
	`)
}

func CoreProgram(x int, y int, text string) {
	robotgo.Move(x, y)
	fmt.Println(text)
}

func main() {
	// os.Args[0] ? o nome do execut?vel
	if len(os.Args) == 1 {
		PainelPrincipal()
		return
	}
	// esperamos exatamente 4 argumentos: x y button path
	if len(os.Args) > 3 {
		ErrorPainel()
		os.Exit(1)
	}

	x, err := strconv.Atoi(os.Args[1])
	if err != nil {
		ErrorPainel()
		os.Exit(1)
	}
	y, err := strconv.Atoi(os.Args[2])
	if err != nil {
		ErrorPainel()
		os.Exit(1)
	}
	Text := os.Args[3]
	CoreProgram(x, y, Text)
}
